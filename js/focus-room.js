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

    function formatClock(totalSeconds) {
        var safeSeconds = Math.max(0, Math.ceil(totalSeconds));
        var minutes = Math.floor(safeSeconds / 60);
        var seconds = safeSeconds % 60;
        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    function setHidden(element, shouldHide) {
        if (!element) {
            return;
        }

        if (shouldHide) {
            element.setAttribute('hidden', '');
        } else {
            element.removeAttribute('hidden');
        }
    }

    var html = document.documentElement;
    var body = document.body;
    var pageContent = document.querySelector('[data-page-content]');

    var openRoomButtons = Array.prototype.slice.call(document.querySelectorAll('[data-open-room]'));
    var closeRoomButtons = Array.prototype.slice.call(document.querySelectorAll('[data-close-room]'));

    var previewStage = document.querySelector('[data-preview-stage]');
    var previewTrack = document.querySelector('[data-preview-track]');
    var previewStatus = document.querySelector('[data-preview-status]');
    var previewPrompt = document.querySelector('[data-preview-prompt]');

    var appShell = document.querySelector('[data-app-shell]');
    var appDialog = document.querySelector('[data-app-dialog]');
    var appPhaseLabel = document.querySelector('[data-app-phase-label]');
    var appMixSummary = document.querySelector('[data-app-mix-summary]');
    var appTopbarNote = document.querySelector('.fr-app-topbar-note');
    var appPhaseSections = Array.prototype.slice.call(document.querySelectorAll('[data-app-phase]'));

    var appThresholdStage = document.querySelector('[data-app-threshold-stage]');
    var appThresholdTrigger = document.querySelector('[data-app-threshold-trigger]');
    var appThresholdLabel = document.querySelector('[data-app-threshold-label]');
    var appThresholdProgress = document.querySelector('[data-app-threshold-progress]');
    var appThresholdPrompt = document.querySelector('[data-app-threshold-prompt]');
    var appThresholdState = document.querySelector('[data-app-threshold-state]');

    var appRoomShell = document.querySelector('[data-app-room-shell]');
    var appRoomNote = document.querySelector('[data-app-room-note]');
    var appCompletionNote = document.querySelector('[data-app-completion-note]');
    var appSessionClock = document.querySelector('[data-app-session-clock]');
    var appSessionStatus = document.querySelector('[data-app-session-status]');
    var appRingProgress = document.querySelector('[data-app-ring-progress]');
    var appSceneLabel = document.querySelector('[data-app-scene-label]');
    var appSceneSub = document.querySelector('[data-app-scene-sub]');
    var appDurationButtons = Array.prototype.slice.call(document.querySelectorAll('[data-app-duration]'));
    var appStartButton = document.querySelector('[data-app-session-start]');
    var appResetButton = document.querySelector('[data-app-session-reset]');
    var appMixerPanel = document.querySelector('[data-app-mixer-panel]');
    var appMixerToggles = Array.prototype.slice.call(document.querySelectorAll('[data-app-mixer-toggle]'));
    var sceneStage = document.querySelector('[data-scene-stage]');
    var sceneVideo = document.querySelector('[data-scene-video]');
    var sceneButtons = Array.prototype.slice.call(document.querySelectorAll('[data-scene-key]'));
    var sceneSource = sceneVideo ? sceneVideo.querySelector('source') : null;

    var hudGhostPanels = Array.prototype.slice.call(document.querySelectorAll('.fr-console-room__hud[data-app-ghost-panel]'));
    var consoleGhostPanels = Array.prototype.slice.call(document.querySelectorAll('.fr-console-rack[data-app-ghost-panel], .fr-transport-bar[data-app-ghost-panel], .fr-scene-switcher[data-app-ghost-panel]'));
    var layerToggles = Array.prototype.slice.call(document.querySelectorAll('[data-app-layer-toggle]'));
    var layerSliders = Array.prototype.slice.call(document.querySelectorAll('[data-app-layer-volume]'));
    var atmosphereInputs = Array.prototype.slice.call(document.querySelectorAll('[data-app-atmosphere]'));

    var codeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-code-file]'));
    var codePath = document.querySelector('[data-code-path]');
    var codeContent = document.querySelector('[data-code-content]');
    var codeStatus = document.querySelector('[data-code-status]');

    var layerNames = ['piano', 'rain', 'wind', 'cafe', 'water'];
    var layerDisplayNames = {
        piano: 'Piano',
        rain: 'Rain',
        wind: 'Wind',
        cafe: 'Cafe',
        water: 'Water'
    };
    var AUDIO_SOURCES = {
        piano: './swiftui-prototype/public/audio/piano/piano-last-night.mp3',
        rain: './swiftui-prototype/public/audio/rain/light-rain.mp3',
        cafe: './swiftui-prototype/public/audio/cafe/cafe-ambience-soft.mp3',
        wind: './swiftui-prototype/public/audio/wind/arctic-cold-wind.mp3',
        water: './swiftui-prototype/public/audio/water/mountain-stream.mp3',
        chime: './swiftui-prototype/public/audio/chime/wind-chime-toll.mp3'
    };
    var SCENE_VIDEOS = {
        midnight: {
            label: 'Windowlight at Midnight',
            sub: 'Rain-lit glass / warm desk light',
            src: './swiftui-prototype/public/video/Windowlight%20at%20Midnight.mp4'
        },
        sanctuary: {
            label: 'The Focus Sanctuary',
            sub: 'Protected interior / slow quiet rain',
            src: './swiftui-prototype/public/video/The%20Focus%20Sanctuary.mp4'
        },
        coffee: {
            label: 'Coffee at Midnight',
            sub: 'Warm cafe shadows / soft city rain',
            src: './swiftui-prototype/public/video/Coffee%20at%20Midnight.mp4'
        },
        calmCafe: {
            label: 'The Calm Cafe',
            sub: 'Gentle amber / easier room tone',
            src: './swiftui-prototype/public/video/The%20Calm%20Caf%C3%A9.mp4'
        },
        cloister: {
            label: 'The Cloister Silence',
            sub: 'Stone stillness / sacred quiet',
            src: './swiftui-prototype/public/video/The%20Cloister%20Silence.mp4'
        },
        library: {
            label: 'The Library of Night',
            sub: 'Quiet archive / deeper shadow',
            src: './swiftui-prototype/public/video/The%20Library%20of%20Night.mp4'
        }
    };
    var storageKey = 'focus-room.web-settings';

    var previewState = {
        frame: null,
        startedAt: 0,
        duration: 8000,
        hovered: false
    };

    var appState = {
        isOpen: false,
        phase: 'threshold',
        lastTrigger: null,
        scrollY: 0,
        thresholdSceneFrame: null
    };

    var thresholdState = {
        active: false,
        hovered: false,
        holdProgress: 0,
        holdFrame: null,
        startedAt: 0,
        holdDuration: 1450
    };

    var sessionState = {
        selectedMinutes: 25,
        demoDurationMs: 90000,
        running: false,
        startedAt: null,
        pausedElapsedMs: 0,
        frame: null,
        completionVisible: false,
        ghostTimer: null,
        mixerExpanded: false,
        sceneKey: 'midnight'
    };

    var audioState = {
        hasUserInteracted: false,
        layers: {},
        chime: null,
        completionTimer: null
    };

    var atmosphereState = {
        warmth: 0.42,
        focusDepth: 0.36,
        fog: 0.28
    };

    var visualState = {
        progress: 0,
        lampWarmthBoost: 0,
        rainDensityBoost: 0,
        consoleDim: 0.08,
        hudFade: 1
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
            '    @Published private(set) var ambientLayers: [AmbientLayerSetting]',
            '    @Published private(set) var sessionState: FocusSessionState = .idle',
            '    @Published private(set) var controlsOpacity: Double = 0.96',
            '',
            '    private let preferencesStore: FocusRoomPreferencesStoring',
            '    private let audioEngine: AmbientAudioControlling',
            '    private let soundscape: any RoomSoundscapeStrategy',
            '',
            '    func registerInteraction() {',
            '        guard phase == .room else { return }',
            '        idleTask?.cancel()',
            '        withAnimation(.easeOut(duration: 0.25)) {',
            '            controlsOpacity = 1',
            '        }',
            '    }',
            '',
            '    func applyTimerProgress(_ progress: Double) {',
            '        let mix = soundscape.makeMix(from: ambientLayers, sessionProgress: progress)',
            '        audioEngine.update(mix)',
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
            '',
            '    init(defaults: UserDefaults = .standard, key: String = "focus-room.preferences") {',
            '        self.defaults = defaults',
            '        self.key = key',
            '    }',
            '',
            '    func load() -> FocusRoomPreferences {',
            '        guard let data = defaults.data(forKey: key) else {',
            '            return .default',
            '        }',
            '',
            '        return (try? JSONDecoder().decode(FocusRoomPreferences.self, from: data)) ?? .default',
            '    }',
            '',
            '    func save(_ preferences: FocusRoomPreferences) {',
            '        guard let data = try? JSONEncoder().encode(preferences) else { return }',
            '        defaults.set(data, forKey: key)',
            '    }',
            '}'
        ].join('\n'),
        soundscape: [
            'import Foundation',
            '',
            'enum FocusRoomKind: String, CaseIterable, Codable, Identifiable {',
            '    case study',
            '    case library',
            '    case forest',
            '',
            '    var id: String { rawValue }',
            '}',
            '',
            'protocol RoomSoundscapeStrategy {',
            '    var roomKind: FocusRoomKind { get }',
            '    func defaultLayers() -> [AmbientLayerSetting]',
            '    func makeMix(from layers: [AmbientLayerSetting], sessionProgress: Double) -> [AmbientLayerMix]',
            '    func makeAtmosphere(from layers: [AmbientLayerSetting], sessionProgress: Double, sessionState: FocusSessionState, earnedStars: Int) -> RoomAtmosphere',
            '}',
            '',
            'enum RoomSoundscapeFactory {',
            '    static func makeStrategy(for roomKind: FocusRoomKind) -> any RoomSoundscapeStrategy {',
            '        switch roomKind {',
            '        case .study: return StudyRoomSoundscapeStrategy()',
            '        case .library: return LibraryRoomSoundscapeStrategy()',
            '        case .forest: return ForestRoomSoundscapeStrategy()',
            '        }',
            '    }',
            '}'
        ].join('\n'),
        haptics: [
            'import Foundation',
            '',
            '#if canImport(UIKit)',
            'import UIKit',
            '#endif',
            '',
            'enum FocusRoomHaptics {',
            '    static func prepareThreshold() {',
            '        #if canImport(UIKit)',
            '        soft.prepare()',
            '        medium.prepare()',
            '        rigid.prepare()',
            '        #endif',
            '    }',
            '',
            '    static func holdPulse(progress: Double) {',
            '        #if canImport(UIKit)',
            '        let generator: UIImpactFeedbackGenerator = progress < 0.82 ? medium : rigid',
            '        generator.prepare()',
            '        generator.impactOccurred(intensity: CGFloat(0.22 + (progress * 0.72)))',
            '        #endif',
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

    function getLayerDisplayName(layerName) {
        return layerDisplayNames[layerName] || (layerName.charAt(0).toUpperCase() + layerName.slice(1));
    }

    function getLayerElements(layerName) {
        return {
            toggle: document.querySelector('[data-app-layer-toggle="' + layerName + '"]'),
            slider: document.querySelector('[data-app-layer-volume="' + layerName + '"]')
        };
    }

    function getLayerState(layerName) {
        var elements = getLayerElements(layerName);

        return {
            enabled: !!(elements.toggle && elements.toggle.checked),
            volume: elements.slider ? clamp(Number(elements.slider.value || '0'), 0, 1) : 0
        };
    }

    function syncSceneVideoPlayback() {
        if (!sceneVideo) {
            return;
        }

        sceneVideo.muted = true;
        sceneVideo.loop = true;
        sceneVideo.playsInline = true;

        if (prefersReducedMotion() || !appState.isOpen || appState.phase !== 'room') {
            sceneVideo.pause();
            return;
        }

        var playPromise = sceneVideo.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    function setSceneVideo(sceneKey, shouldSave) {
        var nextKey = Object.prototype.hasOwnProperty.call(SCENE_VIDEOS, sceneKey) ? sceneKey : 'midnight';
        var scene = SCENE_VIDEOS[nextKey];

        sessionState.sceneKey = nextKey;

        if (sceneStage) {
            sceneStage.setAttribute('data-scene-active', nextKey);
        }

        sceneButtons.forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-scene-key') === nextKey);
        });

        if (appSceneLabel) {
            appSceneLabel.textContent = scene.label;
        }

        if (appSceneSub) {
            appSceneSub.textContent = scene.sub;
        }

        if (sceneVideo && sceneSource) {
            if (sceneSource.getAttribute('src') !== scene.src) {
                sceneSource.setAttribute('src', scene.src);
                sceneVideo.load();
            }

            sceneVideo.setAttribute('aria-label', scene.label);
        }

        syncSceneVideoPlayback();

        if (shouldSave) {
            saveSettings();
        }
    }

    function safePreloadAudio(audio) {
        if (!audio || typeof audio.load !== 'function') {
            return;
        }

        try {
            audio.load();
        } catch (error) {
            // Ignore preload failures and let play() surface issues later.
        }
    }

    function createAudioController(key, source, options) {
        if (!source) {
            return null;
        }

        var config = options || {};
        var audio = new Audio(source);
        audio.preload = config.preload || 'auto';
        audio.loop = !!config.loop;
        audio.volume = clamp(typeof config.volume === 'number' ? config.volume : 0, 0, 1);
        audio.playsInline = true;

        safePreloadAudio(audio);

        return {
            key: key,
            audio: audio,
            loop: !!config.loop,
            frame: null
        };
    }

    function initializeAudioEngine() {
        layerNames.forEach(function (layerName) {
            audioState.layers[layerName] = createAudioController(layerName, AUDIO_SOURCES[layerName], {
                loop: true,
                volume: 0
            });
        });

        audioState.chime = createAudioController('chime', AUDIO_SOURCES.chime, {
            loop: false,
            volume: 0.42
        });
    }

    function registerAudioInteraction() {
        audioState.hasUserInteracted = true;
    }

    function safePlayAudio(audio) {
        if (!audio || !audioState.hasUserInteracted) {
            return Promise.resolve(false);
        }

        var playPromise = audio.play();

        if (!playPromise || typeof playPromise.then !== 'function') {
            return Promise.resolve(true);
        }

        return playPromise.then(function () {
            return true;
        }).catch(function (error) {
            console.warn('Focus Room audio play blocked or failed:', audio.currentSrc || audio.src || 'unknown source', error);
            return false;
        });
    }

    function cancelAudioFade(controller) {
        if (!controller || !controller.frame) {
            return;
        }

        window.cancelAnimationFrame(controller.frame);
        controller.frame = null;
    }

    function completeAudioFade(controller, targetVolume, options) {
        if (!controller || !controller.audio) {
            return;
        }

        var config = options || {};
        var audio = controller.audio;
        var safeTarget = clamp(targetVolume, 0, 1);

        cancelAudioFade(controller);
        audio.volume = safeTarget;

        if (safeTarget <= 0.001) {
            audio.pause();

            if (config.resetOnPause) {
                try {
                    audio.currentTime = 0;
                } catch (error) {
                    // Some browsers can reject currentTime updates during teardown.
                }
            }
        }
    }

    function fadeAudioController(controller, targetVolume, duration, options) {
        if (!controller || !controller.audio) {
            return;
        }

        var config = options || {};
        var audio = controller.audio;
        var safeTarget = clamp(targetVolume, 0, 1);
        var fadeDuration = prefersReducedMotion() ? 0 : Math.max(0, Number(duration) || 0);

        cancelAudioFade(controller);

        var beginTween = function () {
            var startVolume = clamp(Number(audio.volume) || 0, 0, 1);

            if (fadeDuration === 0 || Math.abs(safeTarget - startVolume) < 0.005) {
                completeAudioFade(controller, safeTarget, config);
                return;
            }

            var startedAt = performance.now();

            var step = function (now) {
                var progress = clamp((now - startedAt) / fadeDuration, 0, 1);
                audio.volume = clamp(startVolume + ((safeTarget - startVolume) * progress), 0, 1);

                if (progress >= 1) {
                    completeAudioFade(controller, safeTarget, config);
                    return;
                }

                controller.frame = window.requestAnimationFrame(step);
            };

            controller.frame = window.requestAnimationFrame(step);
        };

        if (safeTarget > 0.001) {
            safePlayAudio(audio).then(function (didStart) {
                if (!didStart) {
                    return;
                }

                beginTween();
            });
            return;
        }

        beginTween();
    }

    function syncLayerAudio(layerName, options) {
        var controller = audioState.layers[layerName];
        var config = options || {};
        var layerState = getLayerState(layerName);
        var shouldPlay = layerState.enabled && layerState.volume > 0.001 && (sessionState.running || !!config.allowPreview);
        var targetVolume = shouldPlay ? layerState.volume : 0;

        fadeAudioController(
            controller,
            targetVolume,
            typeof config.duration === 'number' ? config.duration : (shouldPlay ? 850 : 450),
            {
                resetOnPause: !!config.resetOnPause
            }
        );
    }

    function syncAllLayerAudio(options) {
        layerNames.forEach(function (layerName) {
            syncLayerAudio(layerName, options);
        });
    }

    function stopAllLayerAudio(options) {
        var config = options || {};
        var fadeDuration = typeof config.duration === 'number' ? config.duration : 500;

        layerNames.forEach(function (layerName) {
            fadeAudioController(audioState.layers[layerName], 0, fadeDuration, {
                resetOnPause: !!config.resetOnPause
            });
        });
    }

    function stopCompletionChime() {
        window.clearTimeout(audioState.completionTimer);

        if (!audioState.chime || !audioState.chime.audio) {
            return;
        }

        cancelAudioFade(audioState.chime);

        try {
            audioState.chime.audio.pause();
            audioState.chime.audio.currentTime = 0;
        } catch (error) {
            // Ignore reset failures; the next play attempt will recover.
        }
    }

    function playCompletionChime() {
        if (!audioState.chime || !audioState.chime.audio || !audioState.hasUserInteracted) {
            return;
        }

        stopCompletionChime();
        audioState.chime.audio.volume = 0.42;
        safePlayAudio(audioState.chime.audio);
    }

    function queueCompletionChime(delayMs) {
        window.clearTimeout(audioState.completionTimer);
        audioState.completionTimer = window.setTimeout(function () {
            playCompletionChime();
        }, Math.max(0, delayMs || 0));
    }

    function findFocusableElements(container) {
        if (!container) {
            return [];
        }

        return Array.prototype.slice.call(
            container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
        ).filter(function (element) {
            return !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true' && element.offsetParent !== null;
        });
    }

    function setPageInert(isInert) {
        if (!pageContent) {
            return;
        }

        pageContent.setAttribute('aria-hidden', isInert ? 'true' : 'false');

        if ('inert' in pageContent) {
            pageContent.inert = isInert;
            return;
        }

        if (isInert) {
            pageContent.setAttribute('inert', '');
        } else {
            pageContent.removeAttribute('inert');
        }
    }

    function lockBodyScroll() {
        appState.scrollY = window.scrollY || window.pageYOffset || 0;
        html.classList.add('fr-no-scroll');
        body.classList.add('fr-no-scroll');
        body.style.position = 'fixed';
        body.style.top = '-' + appState.scrollY + 'px';
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
    }

    function unlockBodyScroll() {
        var scrollTarget = appState.scrollY;

        html.classList.remove('fr-no-scroll');
        body.classList.remove('fr-no-scroll');
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.width = '';
        window.scrollTo(0, scrollTarget);
    }

    function renderPreviewScene(now) {
        if (!previewStage) {
            return;
        }

        if (prefersReducedMotion()) {
            previewStage.style.setProperty('--fr-session-progress', previewState.hovered ? '0.240' : '0.140');
            previewStage.style.setProperty('--fr-lamp-warmth', previewState.hovered ? '0.500' : '0.320');
            previewStage.style.setProperty('--fr-rain-strength', previewState.hovered ? '0.560' : '0.260');
            previewStage.style.setProperty('--fr-note-opacity', previewState.hovered ? '0.4' : '0');
            previewStage.style.setProperty('--fr-hover-energy', previewState.hovered ? '0.420' : '0.120');

            if (previewTrack) {
                previewTrack.style.transform = 'scaleX(' + (previewState.hovered ? '0.72' : '0.28') + ')';
            }

            if (previewStatus) {
                previewStatus.textContent = previewState.hovered ? 'Room waking' : 'Room settling';
            }

            return;
        }

        if (!previewState.startedAt) {
            previewState.startedAt = now;
        }

        var loopProgress = ((now - previewState.startedAt) % previewState.duration) / previewState.duration;
        var hoverEnergy = previewState.hovered ? 0.22 : 0;
        var cycleWarm = smoothstep((loopProgress - 0.14) / 0.34);
        var cycleRain = smoothstep((loopProgress - 0.34) / 0.32);
        var cycleNote = smoothstep((loopProgress - 0.77) / 0.17);
        var sessionProgress = clamp(0.08 + loopProgress * 0.24 + hoverEnergy * 0.2, 0.08, 0.62);
        var lampWarmth = clamp(0.24 + cycleWarm * 0.34 + hoverEnergy * 0.18, 0.22, 1);
        var rainStrength = clamp(0.16 + cycleRain * 0.42 + hoverEnergy * 0.16, 0.12, 1);
        var noteOpacity = clamp(cycleNote * 0.92, 0, 1);
        var hoverVisual = clamp(0.12 + hoverEnergy + cycleWarm * 0.12, 0, 1);
        var statusText = 'Room settling';

        if (loopProgress < 0.28) {
            statusText = 'Room settling';
        } else if (loopProgress < 0.56) {
            statusText = 'Lamp warming';
        } else if (loopProgress < 0.82) {
            statusText = 'Rain deepening';
        } else {
            statusText = 'Soft note arriving';
        }

        if (previewState.hovered) {
            statusText = 'Preview awake';
        }

        previewStage.style.setProperty('--fr-hover-energy', hoverVisual.toFixed(3));
        previewStage.style.setProperty('--fr-demo-progress', loopProgress.toFixed(3));
        previewStage.style.setProperty('--fr-session-progress', sessionProgress.toFixed(3));
        previewStage.style.setProperty('--fr-lamp-warmth', lampWarmth.toFixed(3));
        previewStage.style.setProperty('--fr-rain-strength', rainStrength.toFixed(3));
        previewStage.style.setProperty('--fr-note-opacity', noteOpacity.toFixed(3));

        if (previewTrack) {
            previewTrack.style.transform = 'scaleX(' + Math.max(0.08, loopProgress).toFixed(3) + ')';
        }

        if (previewStatus) {
            previewStatus.textContent = statusText;
        }

        previewState.frame = window.requestAnimationFrame(renderPreviewScene);
    }

    function beginPreviewLoop() {
        if (!previewStage) {
            return;
        }

        if (previewState.frame) {
            window.cancelAnimationFrame(previewState.frame);
            previewState.frame = null;
        }

        previewState.startedAt = 0;
        renderPreviewScene(performance.now());
    }

    function setPreviewAwake(isAwake) {
        if (!previewStage) {
            return;
        }

        previewState.hovered = !!isAwake;
        previewStage.classList.toggle('is-awake', previewState.hovered);

        if (previewPrompt) {
            previewPrompt.textContent = previewState.hovered
                ? 'Rain and lamp glow wake first. Open the fullscreen room when you are ready.'
                : 'Hover wakes the room. Open the fullscreen experience to begin.';
        }
    }

    function setAppPhase(phaseName) {
        appState.phase = phaseName;

        appPhaseSections.forEach(function (section) {
            setHidden(section, section.getAttribute('data-app-phase') !== phaseName);
        });

        if (appPhaseLabel) {
            appPhaseLabel.textContent = phaseName === 'room' ? 'Room' : 'Threshold';
        }

        if (appTopbarNote) {
            appTopbarNote.textContent = phaseName === 'room'
                ? 'Keep the room gentle. Start when the mix already feels right.'
                : 'Press and hold to let the room surface.';
        }

        syncSceneVideoPlayback();
    }

    function setThresholdPromptCopy() {
        if (!appThresholdLabel || !appThresholdPrompt || !appThresholdState) {
            return;
        }

        if (thresholdState.active) {
            appThresholdLabel.textContent = 'Holding';
            appThresholdPrompt.textContent = 'Stay steady. Blur softens and the room begins to rise.';
            appThresholdState.textContent = 'Threshold opening';
            return;
        }

        appThresholdLabel.textContent = 'Hold to Enter';
        appThresholdPrompt.textContent = thresholdState.hovered
            ? 'The room is awake. Hold for a breath to cross the threshold.'
            : 'Press and hold to let the room surface.';
        appThresholdState.textContent = thresholdState.hovered ? 'Room waking' : 'Ready when you are';
    }

    function setThresholdHoldProgress(progress) {
        var safeProgress = clamp(progress, 0, 1);
        thresholdState.holdProgress = safeProgress;

        if (appThresholdStage) {
            appThresholdStage.style.setProperty('--fr-hold-progress', safeProgress.toFixed(3));
        }

        if (appThresholdProgress) {
            appThresholdProgress.style.width = (safeProgress * 100).toFixed(1) + '%';
        }
    }

    function renderAppThresholdScene(now) {
        if (!appState.isOpen || appState.phase !== 'threshold' || !appThresholdStage) {
            return;
        }

        if (prefersReducedMotion()) {
            appThresholdStage.style.setProperty('--fr-session-progress', thresholdState.active ? '0.260' : '0.120');
            appThresholdStage.style.setProperty('--fr-lamp-warmth', thresholdState.active ? '0.620' : '0.320');
            appThresholdStage.style.setProperty('--fr-rain-strength', thresholdState.active ? '0.620' : (thresholdState.hovered ? '0.420' : '0.240'));
            appThresholdStage.style.setProperty('--fr-note-opacity', thresholdState.active ? '0.24' : '0');
            appThresholdStage.style.setProperty('--fr-hover-energy', thresholdState.hovered ? '0.420' : '0.120');
            return;
        }

        var time = now * 0.001;
        var floatPulse = (Math.sin(time * 1.1) + 1) * 0.5;
        var holdEnergy = thresholdState.holdProgress * 0.72;
        var hoverEnergy = thresholdState.hovered ? 0.18 : 0;
        var sessionProgress = clamp(0.08 + floatPulse * 0.08 + hoverEnergy * 0.14 + holdEnergy * 0.22, 0.08, 0.58);
        var lampWarmth = clamp(0.24 + floatPulse * 0.14 + hoverEnergy * 0.12 + holdEnergy * 0.26, 0.2, 1);
        var rainStrength = clamp(0.18 + floatPulse * 0.08 + hoverEnergy * 0.2 + holdEnergy * 0.22, 0.12, 1);
        var noteOpacity = clamp(thresholdState.holdProgress > 0.88 ? (thresholdState.holdProgress - 0.88) / 0.12 : 0, 0, 1);
        var hoverVisual = clamp(0.08 + hoverEnergy + holdEnergy * 0.8, 0, 1);

        appThresholdStage.style.setProperty('--fr-session-progress', sessionProgress.toFixed(3));
        appThresholdStage.style.setProperty('--fr-lamp-warmth', lampWarmth.toFixed(3));
        appThresholdStage.style.setProperty('--fr-rain-strength', rainStrength.toFixed(3));
        appThresholdStage.style.setProperty('--fr-note-opacity', noteOpacity.toFixed(3));
        appThresholdStage.style.setProperty('--fr-hover-energy', hoverVisual.toFixed(3));

        appState.thresholdSceneFrame = window.requestAnimationFrame(renderAppThresholdScene);
    }

    function beginAppThresholdLoop() {
        if (!appThresholdStage) {
            return;
        }

        if (appState.thresholdSceneFrame) {
            window.cancelAnimationFrame(appState.thresholdSceneFrame);
            appState.thresholdSceneFrame = null;
        }

        renderAppThresholdScene(performance.now());
    }

    function stopAppThresholdLoop() {
        if (appState.thresholdSceneFrame) {
            window.cancelAnimationFrame(appState.thresholdSceneFrame);
            appState.thresholdSceneFrame = null;
        }
    }

    function releaseThreshold(shouldResetCopy) {
        thresholdState.active = false;
        thresholdState.startedAt = 0;

        if (appThresholdStage) {
            appThresholdStage.classList.remove('is-holding');
        }

        if (appThresholdTrigger) {
            appThresholdTrigger.classList.remove('is-holding');
        }

        if (thresholdState.holdFrame) {
            window.cancelAnimationFrame(thresholdState.holdFrame);
            thresholdState.holdFrame = null;
        }

        setThresholdHoldProgress(0);

        if (shouldResetCopy) {
            setThresholdPromptCopy();
        }
    }

    function updateRoomNote() {
        if (!appRoomNote) {
            return;
        }

        if (sessionState.completionVisible) {
            appRoomNote.textContent = 'The console exhales a soft reflection, then returns to rain and stillness.';
            return;
        }

        if (sessionState.running) {
            appRoomNote.textContent = 'Transport is live. Light warms, the glass deepens, and the rest of the room falls back.';
            return;
        }

        var activeLayers = layerNames.filter(function (name) {
            var layerState = getLayerState(name);
            return layerState.enabled && layerState.volume > 0.03;
        });

        if (!activeLayers.length) {
            appRoomNote.textContent = 'Bring one channel up before you roll transport and let the room do the rest.';
            return;
        }

        var readableNames = activeLayers.slice(0, 3).map(getLayerDisplayName);

        appRoomNote.textContent = readableNames.join(', ') + (activeLayers.length > 3 ? ', and more' : '') + ' are already carrying the room. Roll transport when it feels right.';
    }

    function updateMixSummary() {
        if (!appMixSummary) {
            return;
        }

        var activeLayers = layerNames.map(function (name) {
            var layerState = getLayerState(name);

            return {
                name: name,
                enabled: layerState.enabled,
                volume: layerState.volume
            };
        }).filter(function (layer) {
            return layer.enabled && layer.volume > 0.03;
        }).sort(function (first, second) {
            return second.volume - first.volume;
        });

        if (!activeLayers.length) {
            appMixSummary.textContent = 'Room muted';
            return;
        }

        var label = activeLayers.slice(0, 3).map(function (layer) {
            return getLayerDisplayName(layer.name);
        }).join(', ');

        appMixSummary.textContent = 'Mix: ' + label;
    }

    function setGhostPanels(isAwake) {
        var hudOpacity = isAwake ? 0.96 : (sessionState.running ? 0.58 : 0.82);
        var consoleOpacity = isAwake ? 1 : 0.98;

        hudGhostPanels.forEach(function (panel) {
            panel.classList.toggle('is-awake', isAwake);
            panel.style.opacity = hudOpacity.toFixed(3);
        });

        consoleGhostPanels.forEach(function (panel) {
            panel.classList.toggle('is-awake', isAwake);
            panel.style.opacity = consoleOpacity.toFixed(3);
        });

        if (appRoomShell) {
            appRoomShell.style.setProperty('--fr-ghost-opacity', consoleOpacity.toFixed(3));
        }
    }

    function defaultMixerExpanded() {
        return true;
    }

    function canCollapseConsole() {
        return false;
    }

    function setMixerExpanded(shouldExpand) {
        var collapsible = canCollapseConsole();

        sessionState.mixerExpanded = true;

        if (appMixerPanel) {
            setHidden(appMixerPanel, false);
        }

        if (appRoomShell) {
            appRoomShell.classList.toggle('is-console-open', sessionState.mixerExpanded);
            appRoomShell.classList.toggle('is-mixer-open', sessionState.mixerExpanded);
        }

        appMixerToggles.forEach(function (button) {
            setHidden(button, true);
            button.setAttribute('aria-expanded', 'true');
            button.textContent = 'Console';
        });

        setGhostPanels(sessionState.mixerExpanded);
    }

    function wakeGhostUI(delayMs) {
        if (!appRoomShell || appState.phase !== 'room') {
            return;
        }

        setGhostPanels(true);
        window.clearTimeout(sessionState.ghostTimer);
        sessionState.ghostTimer = window.setTimeout(function () {
            setGhostPanels(false);
        }, typeof delayMs === 'number' ? delayMs : 1800);
    }

    function applySessionVisuals(progress) {
        if (!appRoomShell) {
            return;
        }

        var eased = smoothstep(progress);

        visualState.progress = eased;
        visualState.lampWarmthBoost = eased * 0.18;
        visualState.rainDensityBoost = eased * 0.14;
        visualState.consoleDim = 0.08 + eased * 0.18;
        visualState.hudFade = 1 - eased * 0.32;

        appRoomShell.style.setProperty('--fr-session-progress', eased.toFixed(3));
        appRoomShell.style.setProperty('--fr-lamp-warmth-boost', visualState.lampWarmthBoost.toFixed(3));
        appRoomShell.style.setProperty('--fr-rain-density-boost', visualState.rainDensityBoost.toFixed(3));
        appRoomShell.style.setProperty('--fr-console-dim', visualState.consoleDim.toFixed(3));
        appRoomShell.style.setProperty('--fr-hud-fade', visualState.hudFade.toFixed(3));
        appRoomShell.style.setProperty('--fr-completion-softness', (sessionState.completionVisible ? 0.84 : eased * 0.16).toFixed(3));
        applyAtmosphereFromConsole();
    }

    function syncLayerVisual(layerName) {
        var toggle = document.querySelector('[data-app-layer-toggle="' + layerName + '"]');
        var slider = document.querySelector('[data-app-layer-volume="' + layerName + '"]');
        var card = document.querySelector('[data-app-layer-card="' + layerName + '"]');
        var valueNodes = Array.prototype.slice.call(document.querySelectorAll('[data-app-layer-value="' + layerName + '"]'));
        var isOn = !!(toggle && toggle.checked);
        var volume = slider ? Number(slider.value || '0') : 0;
        var displayValue = formatPercent(volume);
        var isAudible = isOn && volume > 0.03;

        if (toggle) {
            toggle.setAttribute('aria-checked', isOn ? 'true' : 'false');
        }

        valueNodes.forEach(function (node) {
            node.textContent = displayValue;
        });

        if (card) {
            card.classList.toggle('is-active', isAudible);
            card.style.setProperty('--fr-strip-level', volume.toFixed(3));
            card.style.setProperty('--fr-strip-presence', isAudible ? '1' : '0');
        }

        if (appRoomShell) {
            appRoomShell.classList.toggle('is-' + layerName + '-active', isAudible);
        }

        if (layerName === 'piano' && appRoomShell) {
            appRoomShell.classList.toggle('is-piano-active', isAudible);
        }

        applyAtmosphereFromConsole();
    }

    function syncAllLayers() {
        layerNames.forEach(syncLayerVisual);
        updateMixSummary();
        updateRoomNote();
    }

    function syncAtmosphereInputs() {
        atmosphereInputs.forEach(function (input) {
            var key = input.getAttribute('data-app-atmosphere');
            var value = clamp(Number(input.value || '0'), 0, 1);
            var valueNodes = Array.prototype.slice.call(document.querySelectorAll('[data-app-atmosphere-value="' + key + '"]'));
            var knob = input.closest('.fr-console-knob');

            if (!Object.prototype.hasOwnProperty.call(atmosphereState, key)) {
                return;
            }

            atmosphereState[key] = value;

            if (knob) {
                knob.style.setProperty('--fr-knob-value', value.toFixed(3));
                knob.style.setProperty('--fr-knob-angle', (-120 + value * 240).toFixed(1) + 'deg');
            }

            valueNodes.forEach(function (node) {
                node.textContent = formatPercent(value);
            });
        });

        applyAtmosphereFromConsole();
    }

    function applyAtmosphereFromConsole() {
        if (!appRoomShell) {
            return;
        }

        var rain = getLayerState('rain');
        var piano = getLayerState('piano');
        var wind = getLayerState('wind');
        var cafe = getLayerState('cafe');
        var water = getLayerState('water');

        var rainValue = rain.enabled ? rain.volume : 0;
        var pianoValue = piano.enabled ? piano.volume : 0;
        var windValue = wind.enabled ? wind.volume : 0;
        var cafeValue = cafe.enabled ? cafe.volume : 0;
        var waterValue = water.enabled ? water.volume : 0;

        var warmth = clamp(atmosphereState.warmth + pianoValue * 0.24 + cafeValue * 0.14 + visualState.lampWarmthBoost, 0, 1);
        var focusDepth = clamp(atmosphereState.focusDepth + windValue * 0.16 + visualState.progress * 0.16, 0, 1);
        var fog = clamp(atmosphereState.fog + rainValue * 0.14 + windValue * 0.08, 0, 1);
        var rainStrength = clamp(Math.max(0.06, rainValue) + visualState.rainDensityBoost, 0.06, 1);
        var roomCalm = clamp(0.28 + (1 - cafeValue) * 0.18 + (1 - windValue) * 0.10, 0.18, 0.84);
        var videoBrightness = clamp(0.03 + focusDepth * 0.08 + visualState.progress * 0.04 - rainStrength * 0.03, 0.02, 0.16);
        var videoContrast = clamp(0.06 + focusDepth * 0.14 + visualState.progress * 0.04, 0.04, 0.24);
        var videoSaturation = clamp(0.04 + warmth * 0.16 - fog * 0.04, 0.03, 0.22);
        var videoZoom = clamp(visualState.progress * 0.008 + focusDepth * 0.01, 0, 0.022);
        var fogOverlay = clamp(0.04 + fog * 0.24 + rainStrength * 0.06, 0.04, 0.42);
        var warmthOverlay = clamp(0.04 + warmth * 0.22 + visualState.progress * 0.08, 0.04, 0.38);
        var glassOverlay = clamp(0.05 + rainStrength * 0.18 + waterValue * 0.06, 0.05, 0.32);

        appRoomShell.style.setProperty('--fr-focus-depth', focusDepth.toFixed(3));
        appRoomShell.style.setProperty('--fr-room-calm', roomCalm.toFixed(3));
        appRoomShell.style.setProperty('--fr-console-dim', clamp(visualState.consoleDim + focusDepth * 0.10, 0.08, 0.42).toFixed(3));
        appRoomShell.style.setProperty('--fr-hud-fade', clamp(visualState.hudFade - focusDepth * 0.10, 0.48, 1).toFixed(3));
        appRoomShell.style.setProperty('--fr-video-brightness', videoBrightness.toFixed(3));
        appRoomShell.style.setProperty('--fr-video-contrast', videoContrast.toFixed(3));
        appRoomShell.style.setProperty('--fr-video-saturation', videoSaturation.toFixed(3));
        appRoomShell.style.setProperty('--fr-video-zoom', videoZoom.toFixed(4));
        appRoomShell.style.setProperty('--fr-fog-overlay', fogOverlay.toFixed(3));
        appRoomShell.style.setProperty('--fr-warmth-overlay', warmthOverlay.toFixed(3));
        appRoomShell.style.setProperty('--fr-glass-overlay', glassOverlay.toFixed(3));
    }

    function updateDurationButtons(activeMinutes) {
        appDurationButtons.forEach(function (button) {
            button.classList.toggle('is-active', Number(button.getAttribute('data-app-duration') || '25') === activeMinutes);
        });
    }

    function resetSession() {
        sessionState.running = false;
        sessionState.startedAt = null;
        sessionState.pausedElapsedMs = 0;
        sessionState.completionVisible = false;
        window.clearTimeout(audioState.completionTimer);
        stopCompletionChime();
        stopAllLayerAudio({
            duration: 520,
            resetOnPause: true
        });

        if (sessionState.frame) {
            window.cancelAnimationFrame(sessionState.frame);
            sessionState.frame = null;
        }

        if (appRingProgress) {
            appRingProgress.style.setProperty('--fr-ring-progress', '0.04');
        }

        if (appSessionClock) {
            appSessionClock.textContent = formatClock(sessionState.selectedMinutes * 60);
        }

        if (appSessionStatus) {
            appSessionStatus.textContent = 'Ready';
        }

        if (appStartButton) {
            appStartButton.textContent = 'Start Session';
        }

        if (appCompletionNote) {
            appCompletionNote.classList.remove('is-visible');
        }

        applySessionVisuals(0);
        updateRoomNote();
        setGhostPanels(false);
    }

    function finishSession() {
        sessionState.running = false;
        sessionState.startedAt = null;
        sessionState.pausedElapsedMs = sessionState.demoDurationMs;
        sessionState.completionVisible = true;
        sessionState.frame = null;
        stopAllLayerAudio({
            duration: 900,
            resetOnPause: true
        });
        queueCompletionChime(prefersReducedMotion() ? 0 : 220);

        if (appStartButton) {
            appStartButton.textContent = 'Start Another Session';
        }

        if (appSessionStatus) {
            appSessionStatus.textContent = 'Complete';
        }

        if (appSessionClock) {
            appSessionClock.textContent = '00:00';
        }

        if (appRingProgress) {
            appRingProgress.style.setProperty('--fr-ring-progress', '1');
        }

        if (appCompletionNote) {
            appCompletionNote.classList.add('is-visible');
        }

        applySessionVisuals(1);
        updateRoomNote();
        wakeGhostUI(2600);
    }

    function tickSession(now) {
        if (!sessionState.running) {
            return;
        }

        if (!sessionState.startedAt) {
            sessionState.startedAt = now;
        }

        var elapsed = sessionState.pausedElapsedMs + (now - sessionState.startedAt);
        var progress = clamp(elapsed / sessionState.demoDurationMs, 0, 1);
        var totalSeconds = sessionState.selectedMinutes * 60;
        var secondsRemaining = totalSeconds * (1 - progress);

        if (appRingProgress) {
            appRingProgress.style.setProperty('--fr-ring-progress', progress.toFixed(3));
        }

        if (appSessionClock) {
            appSessionClock.textContent = formatClock(secondsRemaining);
        }

        if (appSessionStatus) {
            appSessionStatus.textContent = progress <= 0 ? 'Ready' : 'Focusing';
        }

        applySessionVisuals(progress);

        if (progress >= 1) {
            finishSession();
            return;
        }

        sessionState.frame = window.requestAnimationFrame(tickSession);
    }

    function startSession() {
        if (sessionState.running) {
            sessionState.running = false;
            sessionState.pausedElapsedMs += sessionState.startedAt ? performance.now() - sessionState.startedAt : 0;
            sessionState.startedAt = null;
            stopAllLayerAudio({
                duration: 420,
                resetOnPause: false
            });

            if (sessionState.frame) {
                window.cancelAnimationFrame(sessionState.frame);
                sessionState.frame = null;
            }

            if (appStartButton) {
                appStartButton.textContent = 'Resume Session';
            }

            if (appSessionStatus) {
                appSessionStatus.textContent = 'Paused';
            }

            updateRoomNote();
            wakeGhostUI();
            return;
        }

        if (sessionState.completionVisible || sessionState.pausedElapsedMs >= sessionState.demoDurationMs) {
            sessionState.pausedElapsedMs = 0;
        }

        stopCompletionChime();

        if (appCompletionNote) {
            appCompletionNote.classList.remove('is-visible');
        }

        sessionState.completionVisible = false;
        sessionState.running = true;
        sessionState.startedAt = null;

        if (appStartButton) {
            appStartButton.textContent = 'Pause Session';
        }

        updateRoomNote();
        wakeGhostUI();
        syncAllLayerAudio({
            duration: 900,
            resetOnPause: false
        });
        sessionState.frame = window.requestAnimationFrame(tickSession);
    }

    function saveSettings() {
        var payload = {
            selectedMinutes: sessionState.selectedMinutes,
            sceneKey: sessionState.sceneKey,
            layers: {},
            atmosphere: {
                warmth: atmosphereState.warmth,
                focusDepth: atmosphereState.focusDepth,
                fog: atmosphereState.fog
            }
        };

        layerNames.forEach(function (name) {
            var toggle = document.querySelector('[data-app-layer-toggle="' + name + '"]');
            var slider = document.querySelector('[data-app-layer-volume="' + name + '"]');

            payload.layers[name] = {
                enabled: !!(toggle && toggle.checked),
                volume: slider ? Number(slider.value || '0') : 0
            };
        });

        try {
            window.localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch (error) {
            return;
        }
    }

    function applyStoredSettings() {
        var raw = null;
        var parsed = null;

        try {
            raw = window.localStorage.getItem(storageKey);
        } catch (error) {
            raw = null;
        }

        if (!raw) {
            syncAtmosphereInputs();
            updateDurationButtons(sessionState.selectedMinutes);
            return;
        }

        try {
            parsed = JSON.parse(raw);
        } catch (error) {
            parsed = null;
        }

        if (!parsed) {
            syncAtmosphereInputs();
            updateDurationButtons(sessionState.selectedMinutes);
            return;
        }

        if (typeof parsed.selectedMinutes === 'number') {
            var matchingButton = null;

            appDurationButtons.some(function (button) {
                if (Number(button.getAttribute('data-app-duration') || '25') === parsed.selectedMinutes) {
                    matchingButton = button;
                    return true;
                }

                return false;
            });

            if (matchingButton) {
                sessionState.selectedMinutes = Number(matchingButton.getAttribute('data-app-duration') || '25');
                sessionState.demoDurationMs = Number(matchingButton.getAttribute('data-app-demo-seconds') || '90') * 1000;
            }
        }

        if (typeof parsed.sceneKey === 'string' && Object.prototype.hasOwnProperty.call(SCENE_VIDEOS, parsed.sceneKey)) {
            sessionState.sceneKey = parsed.sceneKey;
        }

        if (parsed.layers) {
            layerNames.forEach(function (name) {
                var storedLayer = parsed.layers[name];
                var toggle = document.querySelector('[data-app-layer-toggle="' + name + '"]');
                var slider = document.querySelector('[data-app-layer-volume="' + name + '"]');

                if (!storedLayer) {
                    return;
                }

                if (toggle && typeof storedLayer.enabled === 'boolean') {
                    toggle.checked = storedLayer.enabled;
                }

                if (slider && typeof storedLayer.volume === 'number') {
                    slider.value = clamp(storedLayer.volume, 0, 1).toFixed(2);
                }
            });
        }

        if (parsed.atmosphere) {
            atmosphereInputs.forEach(function (input) {
                var key = input.getAttribute('data-app-atmosphere');
                var storedValue = parsed.atmosphere[key];

                if (typeof storedValue === 'number') {
                    input.value = clamp(storedValue, 0, 1).toFixed(2);
                }
            });
        }

        syncAtmosphereInputs();
        updateDurationButtons(sessionState.selectedMinutes);
    }

    function resetThresholdView() {
        thresholdState.active = false;
        thresholdState.hovered = false;

        if (appThresholdStage) {
            appThresholdStage.classList.remove('is-holding');
            appThresholdStage.classList.remove('is-awake');
        }

        if (appThresholdTrigger) {
            appThresholdTrigger.classList.remove('is-holding');
        }

        setThresholdHoldProgress(0);
        setThresholdPromptCopy();
    }

    function completeThresholdEntry() {
        releaseThreshold(false);

        if (appThresholdState) {
            appThresholdState.textContent = 'Entering room';
        }

        if (appThresholdPrompt) {
            appThresholdPrompt.textContent = 'The room opens and the controls fall back into the edges.';
        }

        if (appThresholdLabel) {
            appThresholdLabel.textContent = 'Entering';
        }

        if (appThresholdStage) {
            appThresholdStage.classList.add('is-awake');
            appThresholdStage.style.setProperty('--fr-session-progress', '0.320');
            appThresholdStage.style.setProperty('--fr-lamp-warmth', '0.620');
            appThresholdStage.style.setProperty('--fr-rain-strength', '0.620');
            appThresholdStage.style.setProperty('--fr-note-opacity', '1');
        }

        window.setTimeout(function () {
            setAppPhase('room');
            setMixerExpanded(defaultMixerExpanded());
            stopAppThresholdLoop();
            wakeGhostUI(2600);

            if (appStartButton) {
                appStartButton.focus();
            }
        }, prefersReducedMotion() ? 120 : 320);
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
            completeThresholdEntry();
            return;
        }

        thresholdState.holdFrame = window.requestAnimationFrame(tickThresholdHold);
    }

    function beginThresholdHold(event) {
        if (!appState.isOpen || appState.phase !== 'threshold') {
            return;
        }

        if (event) {
            event.preventDefault();
        }

        thresholdState.active = true;
        thresholdState.startedAt = 0;

        if (appThresholdStage) {
            appThresholdStage.classList.add('is-holding');
            appThresholdStage.classList.add('is-awake');
        }

        if (appThresholdTrigger) {
            appThresholdTrigger.classList.add('is-holding');
        }

        setThresholdPromptCopy();

        if (thresholdState.holdFrame) {
            window.cancelAnimationFrame(thresholdState.holdFrame);
        }

        thresholdState.holdFrame = window.requestAnimationFrame(tickThresholdHold);
    }

    function cancelThresholdHold() {
        if (!appState.isOpen || appState.phase !== 'threshold') {
            return;
        }

        releaseThreshold(true);
    }

    function openRoom(trigger) {
        if (!appShell || !appDialog) {
            return;
        }

        if (appState.isOpen) {
            return;
        }

        appState.lastTrigger = trigger || document.activeElement;
        appState.isOpen = true;
        setAppPhase('threshold');
        resetThresholdView();
        resetSession();
        setMixerExpanded(defaultMixerExpanded());
        syncAllLayers();
        saveSettings();

        appShell.hidden = false;
        appShell.setAttribute('aria-hidden', 'false');
        setPageInert(true);
        lockBodyScroll();

        window.requestAnimationFrame(function () {
            appShell.classList.add('is-open');
        });

        beginAppThresholdLoop();

        window.setTimeout(function () {
            if (appThresholdTrigger) {
                appThresholdTrigger.focus();
            } else {
                appDialog.focus();
            }
        }, prefersReducedMotion() ? 0 : 80);
    }

    function closeRoom() {
        if (!appShell || !appState.isOpen) {
            return;
        }

        appState.isOpen = false;
        syncSceneVideoPlayback();
        cancelThresholdHold();
        stopAppThresholdLoop();
        window.clearTimeout(sessionState.ghostTimer);
        stopCompletionChime();
        stopAllLayerAudio({
            duration: prefersReducedMotion() ? 0 : 320,
            resetOnPause: true
        });

        if (sessionState.running) {
            sessionState.running = false;

            if (sessionState.frame) {
                window.cancelAnimationFrame(sessionState.frame);
                sessionState.frame = null;
            }
        }

        appShell.classList.remove('is-open');
        appShell.setAttribute('aria-hidden', 'true');
        setPageInert(false);
        unlockBodyScroll();
        setMixerExpanded(false);

        window.setTimeout(function () {
            if (!appState.isOpen) {
                appShell.hidden = true;
                setAppPhase('threshold');
                resetThresholdView();
            }
        }, prefersReducedMotion() ? 0 : 280);

        if (appState.lastTrigger && typeof appState.lastTrigger.focus === 'function') {
            appState.lastTrigger.focus();
        }
    }

    function handleDialogKeydown(event) {
        if (!appState.isOpen) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeRoom();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        var focusable = findFocusableElements(appDialog);

        if (!focusable.length) {
            event.preventDefault();
            appDialog.focus();
            return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

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
        codeButtons.forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-code-file') === filePath);
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

        if (!filePath || !codePath || !codeContent) {
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

    if (previewStage) {
        previewStage.addEventListener('pointerenter', function () {
            setPreviewAwake(true);
        });

        previewStage.addEventListener('pointerleave', function () {
            setPreviewAwake(false);
        });

        previewStage.addEventListener('focusin', function () {
            setPreviewAwake(true);
        });

        previewStage.addEventListener('focusout', function () {
            window.setTimeout(function () {
                if (!previewStage.contains(document.activeElement)) {
                    setPreviewAwake(false);
                }
            }, 0);
        });
    }

    openRoomButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            openRoom(button);
        });
    });

    closeRoomButtons.forEach(function (button) {
        button.addEventListener('click', closeRoom);
    });

    if (appShell) {
        appShell.addEventListener('click', function (event) {
            if (event.target === appShell) {
                closeRoom();
            }
        });
    }

    if (appDialog) {
        appDialog.addEventListener('keydown', handleDialogKeydown);
    }

    if (appThresholdTrigger) {
        appThresholdTrigger.addEventListener('pointerdown', beginThresholdHold);
        appThresholdTrigger.addEventListener('pointerup', cancelThresholdHold);
        appThresholdTrigger.addEventListener('pointerleave', cancelThresholdHold);
        appThresholdTrigger.addEventListener('pointercancel', cancelThresholdHold);
        appThresholdTrigger.addEventListener('blur', cancelThresholdHold);
        appThresholdTrigger.addEventListener('keydown', function (event) {
            if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat) {
                beginThresholdHold(event);
            }
        });
        appThresholdTrigger.addEventListener('keyup', function (event) {
            if (event.code === 'Space' || event.code === 'Enter') {
                cancelThresholdHold();
            }
        });
    }

    if (appThresholdStage) {
        appThresholdStage.addEventListener('pointerenter', function () {
            thresholdState.hovered = true;
            appThresholdStage.classList.add('is-awake');
            setThresholdPromptCopy();
        });

        appThresholdStage.addEventListener('pointerleave', function () {
            thresholdState.hovered = false;
            appThresholdStage.classList.remove('is-awake');
            cancelThresholdHold();
            setThresholdPromptCopy();
        });

        appThresholdStage.addEventListener('focusin', function () {
            thresholdState.hovered = true;
            appThresholdStage.classList.add('is-awake');
            setThresholdPromptCopy();
        });

        appThresholdStage.addEventListener('focusout', function () {
            window.setTimeout(function () {
                if (!appThresholdStage.contains(document.activeElement)) {
                    thresholdState.hovered = false;
                    appThresholdStage.classList.remove('is-awake');
                    cancelThresholdHold();
                    setThresholdPromptCopy();
                }
            }, 0);
        });
    }

    if (appRoomShell) {
        ['pointermove', 'pointerdown', 'touchstart', 'focusin'].forEach(function (eventName) {
            appRoomShell.addEventListener(eventName, function () {
                wakeGhostUI();
            }, { passive: true });
        });
    }

    appDurationButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            sessionState.selectedMinutes = Number(button.getAttribute('data-app-duration') || '25');
            sessionState.demoDurationMs = Number(button.getAttribute('data-app-demo-seconds') || '90') * 1000;
            updateDurationButtons(sessionState.selectedMinutes);
            saveSettings();
            resetSession();
            syncAllLayers();
            wakeGhostUI();
        });
    });

    if (appStartButton) {
        appStartButton.addEventListener('click', function () {
            registerAudioInteraction();
            startSession();
            wakeGhostUI();
        });
    }

    if (appResetButton) {
        appResetButton.addEventListener('click', function () {
            resetSession();
            saveSettings();
            syncAllLayers();
            wakeGhostUI();
        });
    }

    appMixerToggles.forEach(function (button) {
        button.addEventListener('click', function () {
            setMixerExpanded(!sessionState.mixerExpanded);
            wakeGhostUI(sessionState.mixerExpanded ? 2400 : 1600);
        });
    });

    layerToggles.forEach(function (toggle) {
        toggle.addEventListener('change', function () {
            var layerName = toggle.getAttribute('data-app-layer-toggle');
            registerAudioInteraction();
            syncLayerVisual(layerName);
            syncLayerAudio(layerName, {
                duration: 360,
                allowPreview: true,
                resetOnPause: false
            });
            saveSettings();
            updateMixSummary();
            updateRoomNote();
            wakeGhostUI();
        });
    });

    layerSliders.forEach(function (slider) {
        slider.addEventListener('input', function () {
            var layerName = slider.getAttribute('data-app-layer-volume');
            registerAudioInteraction();
            syncLayerVisual(layerName);
            syncLayerAudio(layerName, {
                duration: 220,
                allowPreview: true,
                resetOnPause: false
            });
            saveSettings();
            updateMixSummary();
            updateRoomNote();
            wakeGhostUI();
        });
    });

    atmosphereInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            syncAtmosphereInputs();
            saveSettings();
            wakeGhostUI();
        });
    });

    if (sceneVideo) {
        sceneVideo.addEventListener('loadeddata', function () {
            syncSceneVideoPlayback();
        });
    }

    sceneButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            setSceneVideo(button.getAttribute('data-scene-key'), true);
            wakeGhostUI();
        });
    });

    codeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            loadCodeFile(button);
        });
    });

    initializeAudioEngine();
    applyStoredSettings();
    setSceneVideo(sessionState.sceneKey, false);
    syncAtmosphereInputs();
    syncAllLayers();
    resetSession();
    setMixerExpanded(defaultMixerExpanded());
    resetThresholdView();
    beginPreviewLoop();

    window.addEventListener('resize', function () {
        if (!appRoomShell) {
            return;
        }

        setMixerExpanded(sessionState.mixerExpanded);
    });

    if (codeButtons.length) {
        var initialCodeButton = codeButtons.filter(function (button) {
            return button.classList.contains('is-active');
        })[0] || codeButtons[0];
        loadCodeFile(initialCodeButton);
    }

    if (mediaQuery) {
        var handleMotionPreferenceChange = function () {
            beginPreviewLoop();
            syncSceneVideoPlayback();

            if (appState.isOpen && appState.phase === 'threshold') {
                beginAppThresholdLoop();
            }
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleMotionPreferenceChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleMotionPreferenceChange);
        }
    }
}());
