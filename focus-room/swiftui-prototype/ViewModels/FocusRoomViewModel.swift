import Foundation
import SwiftUI

@MainActor
final class FocusRoomViewModel: ObservableObject {
    @Published private(set) var phase: FocusRoomPhase = .threshold
    @Published private(set) var holdProgress: Double = 0
    @Published private(set) var previewLevel: Double = 0
    @Published private(set) var roomKind: FocusRoomKind
    @Published private(set) var selectedPreset: SessionLengthPreset
    @Published private(set) var customMinutes: Int
    @Published private(set) var ambientLayers: [AmbientLayerSetting]
    @Published private(set) var sessionState: FocusSessionState = .idle
    @Published private(set) var secondsRemaining: Int
    @Published private(set) var controlsOpacity: Double = 0
    @Published private(set) var completionMessage: String?
    @Published private(set) var earnedStars: Int = 0

    private let preferencesStore: FocusRoomPreferencesStoring
    private let audioEngine: AmbientAudioControlling
    private var soundscapeStrategy: any RoomSoundscapeStrategy
    private var holdTask: Task<Void, Never>?
    private var sessionTask: Task<Void, Never>?
    private var idleTask: Task<Void, Never>?
    private let holdDurationSeconds = 1.45
    private let holdUpdateInterval: Duration = .milliseconds(16)
    private let ghostIdleFadeDelay: Duration = .milliseconds(1500)
    private let ghostRevealDistance: CGFloat = 100
    private let ghostPeakOpacity: Double = 0.60
    private var totalSessionSeconds: Int
    private var sessionStartedAt: Date?
    private var baselineRemainingSeconds: Int

    let supportedCustomDurations = [45, 60, 75, 90, 120]

    init(
        preferencesStore: FocusRoomPreferencesStoring,
        audioEngine: AmbientAudioControlling
    ) {
        let preferences = preferencesStore.load()
        let strategy = RoomSoundscapeFactory.makeStrategy(for: preferences.roomKind)

        self.preferencesStore = preferencesStore
        self.audioEngine = audioEngine
        soundscapeStrategy = strategy
        roomKind = preferences.roomKind
        selectedPreset = preferences.selectedPreset
        customMinutes = preferences.customMinutes
        ambientLayers = strategy.resolvedLayers(from: preferences.layers)
        totalSessionSeconds = preferences.resolvedMinutes * 60
        baselineRemainingSeconds = preferences.resolvedMinutes * 60
        secondsRemaining = preferences.resolvedMinutes * 60

        refreshAmbientMix(animated: false)
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
        soundscapeStrategy.makeAtmosphere(
            from: ambientLayers,
            sessionProgress: progress,
            sessionState: sessionState,
            earnedStars: earnedStars
        )
    }

    func beginEntryHold() {
        guard phase == .threshold else { return }

        holdTask?.cancel()

        holdTask = Task { @MainActor [weak self] in
            guard let self else { return }

            let startedAt = Date()

            while !Task.isCancelled {
                let elapsed = Date().timeIntervalSince(startedAt)
                let nextProgress = min(max(elapsed / holdDurationSeconds, 0), 1)
                holdProgress = nextProgress
                previewLevel = soundscapeStrategy.previewLevel(for: nextProgress)
                audioEngine.setPreviewLevel(previewLevel)

                if nextProgress >= 1 {
                    enterRoom()
                    return
                }

                try? await Task.sleep(for: holdUpdateInterval)
            }
        }
    }

    func cancelEntryHold() {
        guard phase == .threshold else { return }

        holdTask?.cancel()
        holdTask = nil
        previewLevel = 0
        audioEngine.setPreviewLevel(0)

        withAnimation(.spring(response: 0.42, dampingFraction: 0.88)) {
            holdProgress = 0
        }
    }

    func enterRoom() {
        holdTask?.cancel()
        holdTask = nil
        previewLevel = 0
        audioEngine.setPreviewLevel(0)

        withAnimation(.spring(response: 1.32, dampingFraction: 0.95, blendDuration: 0.16)) {
            phase = .room
            holdProgress = 0
            controlsOpacity = 0
        }

        beginGhostFadeOut()
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
        sessionTask = nil
        sessionStartedAt = nil
        baselineRemainingSeconds = totalSessionSeconds
        secondsRemaining = totalSessionSeconds
        sessionState = .idle
        completionMessage = nil
        refreshAmbientMix(animated: true)
        registerInteraction()
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
        withAnimation(.linear(duration: 0.18)) {
            controlsOpacity = ghostPeakOpacity
        }
        beginGhostFadeOut()
    }

    func updateGhostProximity(pointerLocation: CGPoint, in containerSize: CGSize) {
        guard phase == .room else { return }

        idleTask?.cancel()

        let distanceToBottom = max(0, containerSize.height - pointerLocation.y)
        let normalized = max(0, min(1, 1 - (distanceToBottom / ghostRevealDistance)))
        let nextOpacity = ghostPeakOpacity * normalized

        withAnimation(.linear(duration: 0.12)) {
            controlsOpacity = nextOpacity
        }

        beginGhostFadeOut()
    }

    func notePointerExit() {
        guard phase == .room else { return }
        beginGhostFadeOut()
    }

    func seedThresholdPreview() {
        sessionTask?.cancel()
        holdTask?.cancel()
        idleTask?.cancel()
        phase = .threshold
        sessionState = .idle
        holdProgress = 0
        previewLevel = 0
        controlsOpacity = 0
        completionMessage = nil
        earnedStars = 0
        secondsRemaining = totalSessionSeconds
    }

    func seedRoomPreview(progress previewProgress: Double = 0.38, state: FocusSessionState = .running) {
        sessionTask?.cancel()
        holdTask?.cancel()
        idleTask?.cancel()
        phase = .room
        sessionState = state
        completionMessage = state == .completed ? "Good work. Take a breath." : nil
        earnedStars = state == .completed ? 1 : 0
        let clampedProgress = min(max(previewProgress, 0), 1)
        secondsRemaining = max(0, Int(Double(totalSessionSeconds) * (1 - clampedProgress)))
        controlsOpacity = 0.56
        refreshAmbientMix(animated: false)
    }

    private func startFreshSession() {
        totalSessionSeconds = resolvedMinutes * 60
        secondsRemaining = totalSessionSeconds
        baselineRemainingSeconds = totalSessionSeconds
        completionMessage = nil
        sessionState = .running
        sessionStartedAt = Date()
        refreshAmbientMix(animated: true)
        startSessionLoop()
        registerInteraction()
    }

    private func resumeSession() {
        sessionState = .running
        baselineRemainingSeconds = secondsRemaining
        sessionStartedAt = Date()
        refreshAmbientMix(animated: true)
        startSessionLoop()
        registerInteraction()
    }

    private func pauseSession() {
        syncRemainingTime()
        sessionTask?.cancel()
        sessionTask = nil
        sessionState = .paused
        sessionStartedAt = nil
        refreshAmbientMix(animated: true)
        registerInteraction()
    }

    private func startSessionLoop() {
        sessionTask?.cancel()

        sessionTask = Task { @MainActor [weak self] in
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
        let nextRemaining = max(0, baselineRemainingSeconds - elapsed)

        guard nextRemaining != secondsRemaining else {
            return
        }

        secondsRemaining = nextRemaining
        refreshAmbientMix(animated: true)
    }

    private func finishSession() {
        sessionTask?.cancel()
        sessionTask = nil
        sessionStartedAt = nil
        secondsRemaining = 0
        sessionState = .completed
        completionMessage = "Good work. Take a breath."
        earnedStars += 1
        refreshAmbientMix(animated: true)
        audioEngine.fadeOutAll(duration: 2.6)
        registerInteraction()
    }

    private func updateSessionLength(resetIfNeeded: Bool) {
        totalSessionSeconds = resolvedMinutes * 60

        if resetIfNeeded {
            sessionTask?.cancel()
            sessionTask = nil
            sessionStartedAt = nil
            baselineRemainingSeconds = totalSessionSeconds
            secondsRemaining = totalSessionSeconds
            sessionState = .idle
            completionMessage = nil
            refreshAmbientMix(animated: true)
        }

        persistPreferences()
    }

    private func mutateLayer(_ kind: AmbientLayerKind, mutation: (inout AmbientLayerSetting) -> Void) {
        guard let index = ambientLayers.firstIndex(where: { $0.kind == kind }) else { return }
        var layer = ambientLayers[index]
        mutation(&layer)
        ambientLayers[index] = layer
        refreshAmbientMix(animated: true)
        persistPreferences()
        registerInteraction()
    }

    private func refreshAmbientMix(animated: Bool) {
        let mix = soundscapeStrategy.makeMix(from: ambientLayers, sessionProgress: progress)
        audioEngine.updateMix(mix, animated: animated)
    }

    private func beginGhostFadeOut() {
        idleTask?.cancel()

        idleTask = Task { @MainActor [weak self] in
            do {
                try await Task.sleep(for: ghostIdleFadeDelay)
            } catch {
                return
            }

            guard let self else { return }

            withAnimation(.spring(response: 0.9, dampingFraction: 0.96)) {
                controlsOpacity = 0
            }
        }
    }

    private func persistPreferences() {
        preferencesStore.save(
            FocusRoomPreferences(
                roomKind: roomKind,
                selectedPreset: selectedPreset,
                customMinutes: customMinutes,
                layers: ambientLayers
            )
        )
    }
}
