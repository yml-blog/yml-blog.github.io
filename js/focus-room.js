(function () {
    'use strict';

    var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    function prefersReducedMotion() {
        return !!(mediaQuery && mediaQuery.matches);
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function smoothstep(value) {
        var x = clamp(value, 0, 1);
        return x * x * (3 - 2 * x);
    }

    function formatPercent(value) {
        return Math.round(value * 100) + '%';
    }

    var thresholdStage = document.querySelector('[data-threshold-stage]');
    var thresholdTrigger = document.querySelector('[data-threshold-trigger]');
    var thresholdLabel = document.querySelector('[data-threshold-label]');
    var thresholdPrompt = document.querySelector('[data-threshold-prompt]');
    var thresholdDemoTrack = document.querySelector('[data-demo-track]');
    var thresholdDemoStatus = document.querySelector('[data-demo-status]');
    var prototypeAnchor = document.querySelector('#prototype');
    var roomShell = document.querySelector('[data-room-shell]');
    var ghostPanels = Array.prototype.slice.call(document.querySelectorAll('[data-ghost-panel]'));
    var codeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-code-file]'));
    var codePath = document.querySelector('[data-code-path]');
    var codeContent = document.querySelector('[data-code-content]');
    var codeStatus = document.querySelector('[data-code-status]');
    var timerDisplay = document.querySelector('[data-session-clock]');
    var timerStatus = document.querySelector('[data-session-status]');
    var timerRing = document.querySelector('[data-ring-progress]');
    var durationButtons = Array.prototype.slice.call(document.querySelectorAll('[data-duration]'));
    var startButton = document.querySelector('[data-session-start]');
    var resetButton = document.querySelector('[data-session-reset]');
    var completionNote = document.querySelector('[data-completion-note]');
    var layerToggles = Array.prototype.slice.call(document.querySelectorAll('[data-layer-toggle]'));
    var layerSliders = Array.prototype.slice.call(document.querySelectorAll('[data-layer-volume]'));

    var thresholdState = {
        active: false,
        hovered: false,
        startedAt: 0,
        holdProgress: 0,
        holdFrame: null,
        demoFrame: null,
        demoStartedAt: 0,
        holdDuration: 1450,
        demoDuration: 8000
    };

    var timerState = {
        selectedMinutes: 25,
        demoDurationMs: 90000,
        running: false,
        startedAt: null,
        pausedElapsedMs: 0,
        frame: null
    };

    var codeFallbacks = {
        viewModel: [
            'import Foundation',
            'import SwiftUI',
            '',
            '@MainActor',
            'final class FocusRoomViewModel: ObservableObject {',
            '    @Published private(set) var phase: FocusRoomPhase = .threshold',
            '    @Published private(set) var holdProgress: Double = 0',
            '    @Published private(set) var previewLevel: Double = 0',
            '    @Published private(set) var ambientLayers: [AmbientLayerSetting]',
            '    @Published private(set) var sessionState: FocusSessionState = .idle',
            '    @Published private(set) var secondsRemaining: Int',
            '    @Published private(set) var controlsOpacity: Double = 0.96',
            '',
            '    private let preferencesStore: FocusRoomPreferencesStoring',
            '    private let audioEngine: AmbientAudioControlling',
            '    private let holdDurationSeconds = 1.45',
            '    private let idleFadeDelay: Duration = .seconds(3)',
            '',
            '    var atmosphere: RoomAtmosphere {',
            '        let rainSetting = ambientLayers.setting(for: .rain)',
            '        let pianoSetting = ambientLayers.setting(for: .piano)',
            '',
            '        return RoomAtmosphere(',
            '            progress: progress,',
            '            lampWarmth: 0.28 + (progress * 0.5),',
            '            backgroundDepth: 0.24 + (progress * 0.46),',
            '            rainIntensity: rainSetting.isEnabled ? max(0.18, rainSetting.volume + (progress * 0.12)) : 0.06,',
            '            pianoIsSpinning: pianoSetting.isEnabled && pianoSetting.volume > 0.05,',
            '            earnedStars: max(earnedStars, sessionState == .completed ? 1 : 0)',
            '        )',
            '    }',
            '',
            '    func registerInteraction() {',
            '        guard phase == .room else { return }',
            '        idleTask?.cancel()',
            '        withAnimation(.easeOut(duration: 0.25)) {',
            '            controlsOpacity = 1',
            '        }',
            '    }',
            '}'
        ].join('\n'),
        preferences: [
            'import Foundation',
            '',
            'protocol FocusRoomPreferencesStoring {',
            '    func load() -> FocusRoomPreferences',
            '    func save(_ preferences: FocusRoomPreferences)',
            '}',
            '',
            'struct UserDefaultsPreferencesStore: FocusRoomPreferencesStoring {',
            '    private let defaults: UserDefaults',
            '    private let key: String',
            '    private let decoder = JSONDecoder()',
            '    private let encoder = JSONEncoder()',
            '',
            '    init(defaults: UserDefaults = .standard, key: String = "focus-room.preferences") {',
            '        self.defaults = defaults',
            '        self.key = key',
            '    }',
            '',
            '    func load() -> FocusRoomPreferences {',
            '        guard',
            '            let data = defaults.data(forKey: key),',
            '            let preferences = try? decoder.decode(FocusRoomPreferences.self, from: data)',
            '        else {',
            '            return .default',
            '        }',
            '',
            '        return preferences',
            '    }',
            '',
            '    func save(_ preferences: FocusRoomPreferences) {',
            '        guard let data = try? encoder.encode(preferences) else {',
            '            return',
            '        }',
            '',
            '        defaults.set(data, forKey: key)',
            '    }',
            '}'
        ].join('\n'),
        appState: [
            'import SwiftUI',
            '',
            '@MainActor',
            'final class AppState: ObservableObject {',
            '    @Published var focusRoom: FocusRoomViewModel',
            '',
            '    init(',
            '        store: FocusRoomPreferencesStoring = UserDefaultsPreferencesStore(),',
            '        audioEngine: AmbientAudioControlling = MockAmbientAudioEngine()',
            '    ) {',
            '        focusRoom = FocusRoomViewModel(preferencesStore: store, audioEngine: audioEngine)',
            '    }',
            '}'
        ].join('\n')
    };

    var ghostTimer = null;

    function scrollBehavior() {
        return prefersReducedMotion() ? 'auto' : 'smooth';
    }

    function setThresholdPromptCopy() {
        if (!thresholdLabel || !thresholdPrompt) {
            return;
        }

        if (thresholdStage && thresholdStage.classList.contains('is-entered')) {
            thresholdLabel.textContent = 'Entered';
            thresholdPrompt.textContent = 'The room opens gently and the main study wakes up below.';
            return;
        }

        if (thresholdState.active) {
            thresholdLabel.textContent = 'Holding';
            thresholdPrompt.textContent = 'Blur lifts, glow opens, and the room begins to come forward.';
            return;
        }

        thresholdLabel.textContent = 'Hold to Enter';
        thresholdPrompt.textContent = thresholdState.hovered
            ? 'Rain wakes first. Hold steady to dissolve the threshold.'
            : 'Hover wakes the room. Hold to step inside.';
    }

    function setThresholdHoldProgress(progress) {
        thresholdState.holdProgress = clamp(progress, 0, 1);

        if (!thresholdStage) {
            return;
        }

        thresholdStage.style.setProperty('--fr-hold-progress', thresholdState.holdProgress.toFixed(3));
    }

    function updateThresholdScene(now) {
        if (!thresholdStage || thresholdStage.classList.contains('is-entered')) {
            return;
        }

        if (prefersReducedMotion()) {
            thresholdStage.style.setProperty('--fr-session-progress', '0.180');
            thresholdStage.style.setProperty('--fr-lamp-warmth', thresholdState.hovered ? '0.380' : '0.320');
            thresholdStage.style.setProperty('--fr-rain-strength', thresholdState.hovered ? '0.380' : '0.240');
            thresholdStage.style.setProperty('--fr-note-opacity', '0');

            if (thresholdDemoTrack) {
                thresholdDemoTrack.style.transform = 'scaleX(0.36)';
            }

            if (thresholdDemoStatus && !thresholdState.active) {
                thresholdDemoStatus.textContent = thresholdState.hovered ? 'Preview awake' : 'Room resting';
            }

            return;
        }

        if (!thresholdState.demoStartedAt) {
            thresholdState.demoStartedAt = now;
        }

        var loopProgress = ((now - thresholdState.demoStartedAt) % thresholdState.demoDuration) / thresholdState.demoDuration;
        var hoverEnergy = thresholdState.hovered ? 0.24 : 0;
        var holdEnergy = thresholdState.holdProgress * 0.72;
        var cycleWarm = smoothstep(clamp((loopProgress - 0.16) / 0.36, 0, 1));
        var cycleRain = smoothstep(clamp((loopProgress - 0.34) / 0.38, 0, 1));
        var cycleNote = smoothstep(clamp((loopProgress - 0.78) / 0.18, 0, 1));
        var sessionProgress = clamp(0.08 + loopProgress * 0.26 + hoverEnergy * 0.18 + holdEnergy * 0.18, 0.08, 0.64);
        var lampWarmth = clamp(0.24 + cycleWarm * 0.28 + hoverEnergy * 0.16 + holdEnergy * 0.24, 0.2, 1);
        var rainStrength = clamp(0.18 + cycleRain * 0.34 + hoverEnergy * 0.24 + holdEnergy * 0.18, 0.1, 1);
        var noteOpacity = clamp(cycleNote * 0.92, 0, 1);
        var stageEnergy = clamp(0.08 + cycleWarm * 0.18 + hoverEnergy + holdEnergy, 0, 1);
        var statusText = 'Room settling';

        if (thresholdState.active) {
            statusText = 'Threshold opening';
        } else if (loopProgress < 0.28) {
            statusText = 'Room settling';
        } else if (loopProgress < 0.58) {
            statusText = 'Lamp warming';
        } else if (loopProgress < 0.82) {
            statusText = 'Rain deepening';
        } else {
            statusText = 'Soft note arriving';
        }

        thresholdStage.style.setProperty('--fr-hover-energy', stageEnergy.toFixed(3));
        thresholdStage.style.setProperty('--fr-demo-progress', loopProgress.toFixed(3));
        thresholdStage.style.setProperty('--fr-session-progress', sessionProgress.toFixed(3));
        thresholdStage.style.setProperty('--fr-lamp-warmth', lampWarmth.toFixed(3));
        thresholdStage.style.setProperty('--fr-rain-strength', rainStrength.toFixed(3));
        thresholdStage.style.setProperty('--fr-note-opacity', noteOpacity.toFixed(3));

        if (thresholdDemoTrack) {
            thresholdDemoTrack.style.transform = 'scaleX(' + Math.max(0.08, loopProgress).toFixed(3) + ')';
        }

        if (thresholdDemoStatus && !thresholdState.active) {
            thresholdDemoStatus.textContent = thresholdState.hovered ? 'Preview awake' : statusText;
        }

        thresholdState.demoFrame = window.requestAnimationFrame(updateThresholdScene);
    }

    function beginThresholdSceneLoop() {
        if (!thresholdStage) {
            return;
        }

        if (thresholdState.demoFrame) {
            window.cancelAnimationFrame(thresholdState.demoFrame);
            thresholdState.demoFrame = null;
        }

        thresholdState.demoStartedAt = 0;
        updateThresholdScene(performance.now());
    }

    function setThresholdAwake(isAwake) {
        if (!thresholdStage || thresholdStage.classList.contains('is-entered')) {
            return;
        }

        thresholdState.hovered = !!isAwake;
        thresholdStage.classList.toggle('is-awake', thresholdState.hovered);
        setThresholdPromptCopy();
    }

    function finishThresholdEntry() {
        if (!thresholdStage) {
            return;
        }

        thresholdState.active = false;
        thresholdStage.classList.remove('is-holding');
        thresholdTrigger && thresholdTrigger.classList.remove('is-holding');
        thresholdStage.classList.add('is-entered');
        document.body.classList.add('is-focus-room-entered');
        setThresholdHoldProgress(1);

        thresholdStage.style.setProperty('--fr-session-progress', '0.320');
        thresholdStage.style.setProperty('--fr-lamp-warmth', '0.620');
        thresholdStage.style.setProperty('--fr-rain-strength', '0.620');
        thresholdStage.style.setProperty('--fr-note-opacity', '1');

        if (thresholdDemoTrack) {
            thresholdDemoTrack.style.transform = 'scaleX(1)';
        }

        if (thresholdDemoStatus) {
            thresholdDemoStatus.textContent = 'Entered';
        }

        setThresholdPromptCopy();

        if (roomShell) {
            roomShell.classList.add('is-awake');
            roomShell.style.setProperty('--fr-session-progress', '0.18');
            roomShell.style.setProperty('--fr-lamp-warmth', '0.36');
            wakeGhostUI();
        }

        if (thresholdState.demoFrame) {
            window.cancelAnimationFrame(thresholdState.demoFrame);
            thresholdState.demoFrame = null;
        }

        window.setTimeout(function () {
            if (prototypeAnchor) {
                prototypeAnchor.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
            }
        }, 360);
    }

    function releaseThreshold(shouldResetLabel) {
        thresholdState.active = false;
        thresholdState.startedAt = 0;
        thresholdStage && thresholdStage.classList.remove('is-holding');
        thresholdTrigger && thresholdTrigger.classList.remove('is-holding');

        if (thresholdState.holdFrame) {
            window.cancelAnimationFrame(thresholdState.holdFrame);
            thresholdState.holdFrame = null;
        }

        if (thresholdStage && !thresholdStage.classList.contains('is-entered')) {
            setThresholdHoldProgress(0);
        }

        if (shouldResetLabel) {
            setThresholdPromptCopy();
        }
    }

    function tickThresholdHold(now) {
        if (!thresholdState.active) {
            return;
        }

        if (!thresholdState.startedAt) {
            thresholdState.startedAt = now;
        }

        var elapsed = now - thresholdState.startedAt;
        var progress = elapsed / thresholdState.holdDuration;
        setThresholdHoldProgress(progress);

        if (progress >= 1) {
            finishThresholdEntry();
            return;
        }

        thresholdState.holdFrame = window.requestAnimationFrame(tickThresholdHold);
    }

    function beginThresholdHold(event) {
        if (!thresholdStage || thresholdStage.classList.contains('is-entered')) {
            return;
        }

        if (event) {
            event.preventDefault();
        }

        thresholdState.active = true;
        thresholdState.startedAt = 0;
        thresholdStage.classList.add('is-holding');
        thresholdTrigger && thresholdTrigger.classList.add('is-holding');
        setThresholdPromptCopy();

        if (thresholdState.holdFrame) {
            window.cancelAnimationFrame(thresholdState.holdFrame);
        }

        thresholdState.holdFrame = window.requestAnimationFrame(tickThresholdHold);
    }

    function cancelThresholdHold() {
        if (!thresholdStage || thresholdStage.classList.contains('is-entered')) {
            return;
        }

        releaseThreshold(true);
    }

    if (thresholdStage && thresholdTrigger) {
        thresholdTrigger.addEventListener('pointerdown', beginThresholdHold);
        thresholdTrigger.addEventListener('pointerup', cancelThresholdHold);
        thresholdTrigger.addEventListener('pointerleave', cancelThresholdHold);
        thresholdTrigger.addEventListener('pointercancel', cancelThresholdHold);
        thresholdTrigger.addEventListener('blur', cancelThresholdHold);
        thresholdTrigger.addEventListener('keydown', function (event) {
            if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat) {
                beginThresholdHold(event);
            }
        });
        thresholdTrigger.addEventListener('keyup', function (event) {
            if (event.code === 'Space' || event.code === 'Enter') {
                cancelThresholdHold();
            }
        });

        thresholdStage.addEventListener('pointerenter', function () {
            setThresholdAwake(true);
        });
        thresholdStage.addEventListener('pointerleave', function () {
            setThresholdAwake(false);
            cancelThresholdHold();
        });
        thresholdStage.addEventListener('focusin', function () {
            setThresholdAwake(true);
        });
        thresholdStage.addEventListener('focusout', function () {
            window.setTimeout(function () {
                if (!thresholdStage.contains(document.activeElement)) {
                    setThresholdAwake(false);
                    cancelThresholdHold();
                }
            }, 0);
        });
    }

    function wakeGhostUI() {
        if (!ghostPanels.length) {
            return;
        }

        ghostPanels.forEach(function (panel) {
            panel.classList.add('is-awake');
        });

        if (roomShell) {
            roomShell.style.setProperty('--fr-ghost-opacity', '0.94');
        }

        window.clearTimeout(ghostTimer);
        ghostTimer = window.setTimeout(function () {
            ghostPanels.forEach(function (panel) {
                panel.classList.remove('is-awake');
            });

            if (roomShell) {
                roomShell.style.setProperty('--fr-ghost-opacity', timerState.running ? '0.34' : '0.54');
            }
        }, 2600);
    }

    if (roomShell) {
        ['pointermove', 'pointerdown', 'touchstart', 'focusin'].forEach(function (eventName) {
            roomShell.addEventListener(eventName, wakeGhostUI, { passive: true });
        });
    }

    function formatTimeFromProgress(progress) {
        var totalSeconds = timerState.selectedMinutes * 60;
        var remainingSeconds = Math.max(0, Math.ceil(totalSeconds * (1 - progress)));
        var minutes = Math.floor(remainingSeconds / 60);
        var seconds = remainingSeconds % 60;
        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    function applySessionVisuals(progress) {
        if (!roomShell) {
            return;
        }

        var clamped = clamp(progress, 0, 1);
        roomShell.style.setProperty('--fr-session-progress', clamped.toFixed(3));
        roomShell.style.setProperty('--fr-lamp-warmth', (0.28 + clamped * 0.48).toFixed(3));

        var rainToggle = document.querySelector('[data-layer-toggle="rain"]');
        var rainSlider = document.querySelector('[data-layer-volume="rain"]');
        var rainStrength = 0.08;

        if (rainToggle && rainToggle.checked && rainSlider) {
            rainStrength = Math.max(0.2, Number(rainSlider.value || '0.55') + clamped * 0.16);
        }

        roomShell.style.setProperty('--fr-rain-strength', Math.min(1, rainStrength).toFixed(3));
        roomShell.style.setProperty('--fr-note-opacity', clamped >= 1 ? '1' : '0');
        roomShell.style.setProperty('--fr-bonus-star-opacity', clamped >= 1 ? '1' : '0');
    }

    function syncLayerVisual(layerName) {
        if (!roomShell) {
            return;
        }

        var toggle = document.querySelector('[data-layer-toggle="' + layerName + '"]');
        var slider = document.querySelector('[data-layer-volume="' + layerName + '"]');
        var valueNodes = Array.prototype.slice.call(document.querySelectorAll('[data-layer-value="' + layerName + '"]'));
        var miniValueNodes = Array.prototype.slice.call(document.querySelectorAll('[data-mini-layer-value="' + layerName + '"]'));
        var miniPills = Array.prototype.slice.call(document.querySelectorAll('[data-mini-layer-pill="' + layerName + '"]'));
        var isOn = !!(toggle && toggle.checked);
        var volume = slider ? Number(slider.value || '0') : 0;
        var displayValue = formatPercent(volume);

        valueNodes.forEach(function (node) {
            node.textContent = displayValue;
        });

        miniValueNodes.forEach(function (node) {
            node.textContent = displayValue;
        });

        miniPills.forEach(function (pill) {
            pill.classList.toggle('is-on', isOn && volume > 0.03);
        });

        if (layerName === 'piano') {
            roomShell.classList.toggle('is-piano-active', isOn && volume > 0.05);
        }

        if (layerName === 'rain') {
            roomShell.style.setProperty('--fr-rain-strength', isOn ? Math.max(0.2, volume).toFixed(3) : '0.08');
        }
    }

    function finishSession() {
        timerState.running = false;
        timerState.startedAt = null;
        timerState.pausedElapsedMs = timerState.demoDurationMs;

        if (startButton) {
            startButton.textContent = 'Start Another Session';
        }

        if (timerStatus) {
            timerStatus.textContent = 'Complete';
        }

        applySessionVisuals(1);

        if (timerDisplay) {
            timerDisplay.textContent = '00:00';
        }

        if (timerRing) {
            timerRing.style.setProperty('--fr-ring-progress', '1');
        }

        if (completionNote) {
            completionNote.classList.add('is-visible');
        }

        wakeGhostUI();
    }

    function tickSession(now) {
        if (!timerState.running) {
            return;
        }

        if (!timerState.startedAt) {
            timerState.startedAt = now;
        }

        var elapsed = timerState.pausedElapsedMs + (now - timerState.startedAt);
        var progress = clamp(elapsed / timerState.demoDurationMs, 0, 1);

        if (timerRing) {
            timerRing.style.setProperty('--fr-ring-progress', progress.toFixed(3));
        }

        if (timerDisplay) {
            timerDisplay.textContent = formatTimeFromProgress(progress);
        }

        if (timerStatus) {
            timerStatus.textContent = progress === 0 ? 'Ready' : 'Focusing';
        }

        applySessionVisuals(progress);

        if (progress >= 1) {
            finishSession();
            return;
        }

        timerState.frame = window.requestAnimationFrame(tickSession);
    }

    function pauseSession() {
        if (!timerState.running) {
            return;
        }

        timerState.running = false;
        timerState.pausedElapsedMs += performance.now() - timerState.startedAt;
        timerState.startedAt = null;

        if (timerState.frame) {
            window.cancelAnimationFrame(timerState.frame);
            timerState.frame = null;
        }

        if (startButton) {
            startButton.textContent = 'Resume Session';
        }

        if (timerStatus) {
            timerStatus.textContent = 'Paused';
        }
    }

    function startSession() {
        if (timerState.running) {
            pauseSession();
            return;
        }

        if (completionNote) {
            completionNote.classList.remove('is-visible');
        }

        timerState.running = true;
        timerState.startedAt = null;

        if (startButton) {
            startButton.textContent = 'Pause Session';
        }

        timerState.frame = window.requestAnimationFrame(tickSession);
        wakeGhostUI();
    }

    function resetSession() {
        timerState.running = false;
        timerState.startedAt = null;
        timerState.pausedElapsedMs = 0;

        if (timerState.frame) {
            window.cancelAnimationFrame(timerState.frame);
            timerState.frame = null;
        }

        if (timerRing) {
            timerRing.style.setProperty('--fr-ring-progress', '0.04');
        }

        if (timerDisplay) {
            timerDisplay.textContent = String(timerState.selectedMinutes).padStart(2, '0') + ':00';
        }

        if (timerStatus) {
            timerStatus.textContent = 'Ready';
        }

        if (startButton) {
            startButton.textContent = 'Start Session';
        }

        if (completionNote) {
            completionNote.classList.remove('is-visible');
        }

        applySessionVisuals(0);
    }

    durationButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            timerState.selectedMinutes = Number(button.getAttribute('data-duration') || '25');
            timerState.demoDurationMs = Number(button.getAttribute('data-demo-seconds') || '90') * 1000;

            durationButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });

            resetSession();
            wakeGhostUI();
        });
    });

    if (startButton) {
        startButton.addEventListener('click', startSession);
    }

    if (resetButton) {
        resetButton.addEventListener('click', function () {
            resetSession();
            wakeGhostUI();
        });
    }

    layerToggles.forEach(function (toggle) {
        toggle.addEventListener('change', function () {
            syncLayerVisual(toggle.getAttribute('data-layer-toggle'));
            wakeGhostUI();
        });
    });

    layerSliders.forEach(function (slider) {
        slider.addEventListener('input', function () {
            syncLayerVisual(slider.getAttribute('data-layer-volume'));
            wakeGhostUI();
        });
    });

    function fallbackContentFor(button, filePath) {
        var explicitKey = button.getAttribute('data-code-fallback-key');

        if (explicitKey && codeFallbacks[explicitKey]) {
            return codeFallbacks[explicitKey];
        }

        if (/App\/AppState\.swift$/.test(filePath)) {
            return codeFallbacks.appState;
        }

        if (/ViewModels\/FocusRoomViewModel\.swift$/.test(filePath)) {
            return codeFallbacks.viewModel;
        }

        if (/Services\/UserPreferencesStore\.swift$/.test(filePath)) {
            return codeFallbacks.preferences;
        }

        return '';
    }

    function updateActiveCodeButtons(filePath) {
        codeButtons.forEach(function (item) {
            item.classList.toggle('is-active', item.getAttribute('data-code-file') === filePath);
        });
    }

    function renderCode(pathLabel, content, statusLabel) {
        if (codePath) {
            codePath.textContent = pathLabel;
        }

        if (codeContent) {
            codeContent.textContent = content;
        }

        if (codeStatus) {
            codeStatus.textContent = statusLabel;
        }
    }

    function loadCodeFile(button) {
        var filePath = button.getAttribute('data-code-file');
        if (!filePath || !codeContent || !codePath) {
            return;
        }

        var pathLabel = filePath.replace('./swiftui-prototype/', 'swiftui-prototype/');
        var fallback = fallbackContentFor(button, filePath);

        updateActiveCodeButtons(filePath);
        renderCode(pathLabel, 'Loading source...', 'Loading');

        if (window.location.protocol === 'file:' && fallback) {
            renderCode(pathLabel, fallback, 'Excerpt loaded for local preview');
            return;
        }

        fetch(filePath)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Unable to load file');
                }

                return response.text();
            })
            .then(function (content) {
                renderCode(pathLabel, content, 'Loaded from the prototype folder');
            })
            .catch(function () {
                if (fallback) {
                    renderCode(pathLabel, fallback, 'Excerpt loaded for local preview');
                    return;
                }

                renderCode(
                    pathLabel,
                    'This viewer can fetch the full file on a deployed site or local HTTP server. On file:// previews, use the highlighted excerpts or open the repository path directly.',
                    'Preview fallback'
                );
            });
    }

    codeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            loadCodeFile(button);
        });
    });

    ['piano', 'rain', 'brownNoise', 'cafe', 'whiteNoise'].forEach(syncLayerVisual);
    resetSession();
    setThresholdPromptCopy();

    if (codeButtons.length) {
        var initialCodeButton = Array.prototype.find
            ? Array.prototype.find.call(codeButtons, function (button) {
                return button.classList.contains('is-active');
            })
            : codeButtons[0];
        loadCodeFile(initialCodeButton || codeButtons[0]);
    }

    beginThresholdSceneLoop();

    if (mediaQuery) {
        var handleMotionPreferenceChange = function () {
            beginThresholdSceneLoop();
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleMotionPreferenceChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleMotionPreferenceChange);
        }
    }
}());
