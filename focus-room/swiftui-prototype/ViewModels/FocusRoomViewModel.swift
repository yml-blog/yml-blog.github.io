import Foundation
import SwiftUI

@MainActor
final class FocusRoomViewModel: ObservableObject {
    @Published private(set) var phase: FocusRoomPhase = .threshold
    @Published private(set) var holdProgress: Double = 0
    @Published private(set) var previewLevel: Double = 0
    @Published private(set) var selectedPreset: SessionLengthPreset
    @Published private(set) var customMinutes: Int
    @Published private(set) var ambientLayers: [AmbientLayerSetting]
    @Published private(set) var sessionState: FocusSessionState = .idle
    @Published private(set) var secondsRemaining: Int
    @Published private(set) var controlsOpacity: Double = 0.96
    @Published private(set) var completionMessage: String?
    @Published private(set) var earnedStars: Int = 0

    private let preferencesStore: FocusRoomPreferencesStoring
    private let audioEngine: AmbientAudioControlling
    private var holdTask: Task<Void, Never>?
    private var sessionTask: Task<Void, Never>?
    private var idleTask: Task<Void, Never>?
    private let holdDurationSeconds = 1.45
    private let idleFadeDelay: Duration = .seconds(3)
    private var totalSessionSeconds: Int
    private var sessionStartedAt: Date?
    private var baselineRemainingSeconds: Int

    let supportedCustomDurations = [45, 60, 75, 90, 120]

    init(
        preferencesStore: FocusRoomPreferencesStoring,
        audioEngine: AmbientAudioControlling
    ) {
        let preferences = preferencesStore.load()
        self.preferencesStore = preferencesStore
        self.audioEngine = audioEngine
        selectedPreset = preferences.selectedPreset
        customMinutes = preferences.customMinutes
        ambientLayers = preferences.layers
        totalSessionSeconds = preferences.resolvedMinutes * 60
        baselineRemainingSeconds = preferences.resolvedMinutes * 60
        secondsRemaining = preferences.resolvedMinutes * 60
        audioEngine.updateLayers(preferences.layers, animated: false)
    }

    var resolvedMinutes: Int {
        selectedPreset.resolvedMinutes(customMinutes: customMinutes)
    }

    var formattedRemainingTime: String {
        let minutes = max(0, secondsRemaining) / 60
        let seconds = max(0, secondsRemaining) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    var progress: Double {
        guard totalSessionSeconds > 0 else { return 0 }
        if sessionState == .completed {
            return 1
        }

        let remaining = Double(max(0, secondsRemaining))
        return max(0, min(1, 1 - (remaining / Double(totalSessionSeconds))))
    }

    var primaryActionTitle: String {
        switch sessionState {
        case .idle:
            return "Start"
        case .running:
            return "Pause"
        case .paused:
            return "Resume"
        case .completed:
            return "Start Again"
        }
    }

    var statusText: String {
        switch sessionState {
        case .idle:
            return "Ready"
        case .running:
            return "Focusing"
        case .paused:
            return "Paused"
        case .completed:
            return "Complete"
        }
    }

    var atmosphere: RoomAtmosphere {
        let rainSetting = ambientLayers.setting(for: .rain)
        let pianoSetting = ambientLayers.setting(for: .piano)

        return RoomAtmosphere(
            progress: progress,
            lampWarmth: 0.28 + (progress * 0.5),
            backgroundDepth: 0.24 + (progress * 0.46),
            rainIntensity: rainSetting.isEnabled ? max(0.18, rainSetting.volume + (progress * 0.12)) : 0.06,
            pianoIsSpinning: pianoSetting.isEnabled && pianoSetting.volume > 0.05,
            earnedStars: max(earnedStars, sessionState == .completed ? 1 : 0)
        )
    }

    func beginEntryHold() {
        guard phase == .threshold else { return }

        holdTask?.cancel()
        previewLevel = 0.68
        audioEngine.setPreviewLevel(previewLevel)

        withAnimation(.easeInOut(duration: holdDurationSeconds)) {
            holdProgress = 1
        }

        holdTask = Task { [weak self] in
            do {
                try await Task.sleep(for: .seconds(holdDurationSeconds))
            } catch {
                return
            }

            guard let self else { return }
            enterRoom()
        }
    }

    func cancelEntryHold() {
        guard phase == .threshold else { return }

        holdTask?.cancel()
        previewLevel = 0
        audioEngine.setPreviewLevel(0)

        withAnimation(.easeOut(duration: 0.25)) {
            holdProgress = 0
        }
    }

    func enterRoom() {
        holdTask?.cancel()
        previewLevel = 0
        audioEngine.setPreviewLevel(0)

        withAnimation(.spring(response: 1.0, dampingFraction: 0.94)) {
            phase = .room
            holdProgress = 0
        }

        registerInteraction()
    }

    func toggleSession() {
        switch sessionState {
        case .idle:
            startFreshSession()
        case .running:
            pauseSession()
        case .paused:
            resumeSession()
        case .completed:
            startFreshSession()
        }
    }

    func resetSession() {
        sessionTask?.cancel()
        sessionStartedAt = nil
        baselineRemainingSeconds = totalSessionSeconds
        secondsRemaining = totalSessionSeconds
        sessionState = .idle
        completionMessage = nil
        registerInteraction()
        applyAmbientLayers(animated: true)
    }

    func selectPreset(_ preset: SessionLengthPreset) {
        selectedPreset = preset
        updateSessionLength(resetIfNeeded: sessionState != .running)
    }

    func setCustomMinutes(_ minutes: Int) {
        customMinutes = min(max(minutes, 10), 180)
        if selectedPreset == .custom {
            updateSessionLength(resetIfNeeded: sessionState != .running)
        } else {
            persistPreferences()
        }
    }

    func toggleLayer(_ kind: AmbientLayerKind) {
        mutateLayer(kind) { layer in
            layer.isEnabled.toggle()
        }
    }

    func setVolume(for kind: AmbientLayerKind, volume: Double) {
        mutateLayer(kind) { layer in
            layer.volume = min(max(volume, 0), 1)
        }
    }

    func registerInteraction() {
        guard phase == .room else { return }

        idleTask?.cancel()
        withAnimation(.easeOut(duration: 0.25)) {
            controlsOpacity = 1
        }

        idleTask = Task { [weak self] in
            do {
                try await Task.sleep(for: idleFadeDelay)
            } catch {
                return
            }

            guard let self else { return }
            let restingOpacity = sessionState == .running ? 0.28 : 0.5
            withAnimation(.spring(response: 1.0, dampingFraction: 0.96)) {
                controlsOpacity = restingOpacity
            }
        }
    }

    func seedThresholdPreview() {
        sessionTask?.cancel()
        phase = .threshold
        sessionState = .idle
        holdProgress = 0
        previewLevel = 0
        controlsOpacity = 0.96
        completionMessage = nil
        earnedStars = 0
        secondsRemaining = totalSessionSeconds
    }

    func seedRoomPreview(progress previewProgress: Double = 0.38, state: FocusSessionState = .running) {
        sessionTask?.cancel()
        phase = .room
        sessionState = state
        completionMessage = state == .completed ? "Good work. Take a breath." : nil
        earnedStars = state == .completed ? 1 : 0
        let clamped = min(max(previewProgress, 0), 1)
        secondsRemaining = max(0, Int(Double(totalSessionSeconds) * (1 - clamped)))
        controlsOpacity = 0.82
    }

    private func startFreshSession() {
        totalSessionSeconds = resolvedMinutes * 60
        secondsRemaining = totalSessionSeconds
        baselineRemainingSeconds = totalSessionSeconds
        completionMessage = nil
        sessionState = .running
        sessionStartedAt = Date()
        audioEngine.updateLayers(ambientLayers, animated: true)
        startSessionLoop()
        registerInteraction()
    }

    private func resumeSession() {
        sessionState = .running
        baselineRemainingSeconds = secondsRemaining
        sessionStartedAt = Date()
        audioEngine.updateLayers(ambientLayers, animated: true)
        startSessionLoop()
        registerInteraction()
    }

    private func pauseSession() {
        syncRemainingTime()
        sessionTask?.cancel()
        sessionState = .paused
        sessionStartedAt = nil
        registerInteraction()
    }

    private func startSessionLoop() {
        sessionTask?.cancel()

        sessionTask = Task { [weak self] in
            guard let self else { return }

            while !Task.isCancelled {
                syncRemainingTime()

                if secondsRemaining <= 0 {
                    finishSession()
                    break
                }

                try? await Task.sleep(for: .seconds(1))
            }
        }
    }

    private func syncRemainingTime() {
        guard
            let sessionStartedAt,
            sessionState == .running
        else {
            return
        }

        let elapsed = Int(Date().timeIntervalSince(sessionStartedAt))
        secondsRemaining = max(0, baselineRemainingSeconds - elapsed)
    }

    private func finishSession() {
        sessionTask?.cancel()
        sessionStartedAt = nil
        secondsRemaining = 0
        sessionState = .completed
        completionMessage = "Good work. Take a breath."
        earnedStars += 1
        audioEngine.fadeOutAll(duration: 2.6)
        registerInteraction()
    }

    private func updateSessionLength(resetIfNeeded: Bool) {
        totalSessionSeconds = resolvedMinutes * 60

        if resetIfNeeded {
            sessionTask?.cancel()
            sessionStartedAt = nil
            baselineRemainingSeconds = totalSessionSeconds
            secondsRemaining = totalSessionSeconds
            sessionState = .idle
            completionMessage = nil
        }

        persistPreferences()
    }

    private func mutateLayer(_ kind: AmbientLayerKind, mutation: (inout AmbientLayerSetting) -> Void) {
        guard let index = ambientLayers.firstIndex(where: { $0.kind == kind }) else { return }
        var layer = ambientLayers[index]
        mutation(&layer)
        ambientLayers[index] = layer
        applyAmbientLayers(animated: true)
        registerInteraction()
    }

    private func applyAmbientLayers(animated: Bool) {
        audioEngine.updateLayers(ambientLayers, animated: animated)
        persistPreferences()
    }

    private func persistPreferences() {
        preferencesStore.save(
            FocusRoomPreferences(
                selectedPreset: selectedPreset,
                customMinutes: customMinutes,
                layers: ambientLayers
            )
        )
    }
}
