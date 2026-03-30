(function () {
    'use strict';

    var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var FOCUS_ROOM_ASSET_VERSION = '20260325-6';

    function prefersReducedMotion() {
        return !!(mediaQuery && mediaQuery.matches);
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function randomBetween(min, max) {
        return min + (Math.random() * (max - min));
    }

    function randomInt(min, max) {
        return Math.floor(randomBetween(min, max + 1));
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
        var hours = Math.floor(safeSeconds / 3600);
        var minutes = Math.floor(safeSeconds / 60);
        var minutesRemainder = Math.floor((safeSeconds % 3600) / 60);
        var seconds = safeSeconds % 60;

        if (hours > 0) {
            return String(hours).padStart(2, '0') + ':' + String(minutesRemainder).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        }

        return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    function formatWordCount(count) {
        return count + ' ' + (count === 1 ? 'word' : 'words');
    }

    function normalizeWritingText(value) {
        return String(value || '')
            .replace(/\r\n?/g, '\n')
            .replace(/\u00a0/g, ' ')
            .replace(/\u200b/g, '')
            .replace(/[ \t]+\n/g, '\n');
    }

    function countWords(text) {
        var matches = normalizeWritingText(text).trim().match(/[A-Za-z0-9\u00c0-\u024f]+(?:['’-][A-Za-z0-9\u00c0-\u024f]+)*/g);
        return matches ? matches.length : 0;
    }

    function sanitizeSceneTitle(title) {
        return String(title || '')
            .replace(/\.mp4$/i, '')
            .replace(/\u00e9/g, 'e')
            .trim();
    }

    function sceneKeyFromTitle(title) {
        return sanitizeSceneTitle(title)
            .toLowerCase()
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function resolveFocusRoomPath(path) {
        var normalized = String(path || '').replace(/\\/g, '/').trim();

        if (!normalized) {
            return '';
        }

        if (/^(?:[a-z]+:)?\/\//i.test(normalized) || /^(?:data|blob|mailto|tel):/i.test(normalized)) {
            return normalized;
        }

        if (normalized.indexOf('../focus-room/') === 0) {
            return normalized;
        }

        if (normalized.indexOf('./') === 0) {
            normalized = normalized.slice(2);
        }

        if (normalized.indexOf('focus-room/') === 0) {
            return '../' + normalized;
        }

        return '../focus-room/' + normalized;
    }

    function appendAssetVersion(path) {
        var resolved = resolveFocusRoomPath(path);

        if (!resolved) {
            return '';
        }

        return resolved + (resolved.indexOf('?') === -1 ? '?' : '&') + 'v=' + encodeURIComponent(FOCUS_ROOM_ASSET_VERSION);
    }

    function encodeSceneFileSource(fileName) {
        return appendAssetVersion('swiftui-prototype/public/video/' + encodeURIComponent(fileName).replace(/%2F/g, '/'));
    }

    function describeSceneTitle(title) {
        var lower = sanitizeSceneTitle(title).toLowerCase();
        var cues = [];

        function pushCue(cue) {
            if (cues.indexOf(cue) === -1) {
                cues.push(cue);
            }
        }

        if (/(midnight|night|late hour)/.test(lower)) {
            pushCue('night frame');
        }

        if (/(rain|drops|mist|water|still water)/.test(lower)) {
            pushCue('weather hush');
        }

        if (/(cafe|coffee)/.test(lower)) {
            pushCue('public hush');
        }

        if (/(library|study|archive|investigation|room|sanctuary|cloister)/.test(lower)) {
            pushCue('interior focus');
        }

        if (/(light|lantern|luminous|warmth|windowlight|star)/.test(lower)) {
            pushCue('tungsten glow');
        }

        if (/(silence|quiet|stillness|natural state|empty)/.test(lower)) {
            pushCue('still air');
        }

        if (/(engineering|system|rules|contract|noir)/.test(lower)) {
            pushCue('noir edge');
        }

        if (/(horizon|beyond time|world|depths)/.test(lower)) {
            pushCue('wide depth');
        }

        return cues.slice(0, 2).join(' / ') || 'cinematic room / ambient console';
    }

    function buildSceneCatalog(definitions) {
        var map = {};
        var order = [];

        definitions.forEach(function (definition) {
            var file = definition.file;
            var label = sanitizeSceneTitle(definition.label || file);
            var key = definition.key || sceneKeyFromTitle(label);

            if (!file || map[key]) {
                return;
            }

            map[key] = {
                label: label,
                sub: definition.sub || describeSceneTitle(label),
                src: definition.src || encodeSceneFileSource(file)
            };
            order.push(key);
        });

        return {
            map: map,
            order: order
        };
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
    var appRoomTitle = document.querySelector('[data-app-room-title]');
    var appTopbarNote = document.querySelector('.fr-app-topbar-note');
    var appPhaseSections = Array.prototype.slice.call(document.querySelectorAll('[data-app-phase]'));
    var appModeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-app-mode-control]'));
    var appEntryTitle = document.querySelector('[data-app-entry-title]');
    var appEntryDescription = document.querySelector('[data-app-entry-description]');

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
    var appPresenceCount = document.querySelector('[data-app-presence-count]');
    var appPresenceGrid = document.querySelector('[data-app-presence-grid]');
    var appSceneLabel = document.querySelector('[data-app-scene-label]');
    var appSceneSub = document.querySelector('[data-app-scene-sub]');
    var appDurationButtons = Array.prototype.slice.call(document.querySelectorAll('[data-app-duration]'));
    var appStartButton = document.querySelector('[data-app-session-start]');
    var appResetButton = document.querySelector('[data-app-session-reset]');
    var appMixerPanel = document.querySelector('[data-app-mixer-panel]');
    var appMixerToggles = Array.prototype.slice.call(document.querySelectorAll('[data-app-mixer-toggle]'));
    var layerDrawer = document.querySelector('[data-app-layer-drawer]');
    var layerDrawerTitle = document.querySelector('[data-app-layer-drawer-title]');
    var layerDrawerMeta = document.querySelector('[data-app-layer-drawer-meta]');
    var layerDrawerTracks = document.querySelector('[data-app-layer-drawer-tracks]');
    var layerDrawerClose = document.querySelector('[data-app-layer-drawer-close]');
    var layerList = document.querySelector('[data-app-layer-list]');
    var sceneStage = document.querySelector('[data-scene-stage]');
    var sceneVideo = document.querySelector('[data-scene-video]');
    var sceneGrid = document.querySelector('[data-scene-grid]');
    var sceneSwitcher = document.querySelector('[data-scene-switcher]');
    var sceneSwitcherBody = document.querySelector('[data-scene-switcher-body]');
    var sceneSwitcherToggle = document.querySelector('[data-scene-switcher-toggle]');
    var sceneSwitcherActive = document.querySelector('[data-scene-switcher-active]');
    var sceneButtons = [];
    var sceneSource = sceneVideo ? sceneVideo.querySelector('source') : null;
    var writingShell = document.querySelector('[data-writing-shell]');
    var writingTaskInput = document.querySelector('[data-writing-task]');
    var writingEditor = document.querySelector('[data-writing-editor]');
    var writingWordCount = document.querySelector('[data-writing-word-count]');
    var writingCadence = document.querySelector('[data-writing-cadence]');
    var writingStateLabel = document.querySelector('[data-writing-state-label]');
    var writingWhisper = document.querySelector('[data-writing-whisper]');

    var hudGhostPanels = Array.prototype.slice.call(document.querySelectorAll('.fr-console-room__hud[data-app-ghost-panel]'));
    var consoleGhostPanels = Array.prototype.slice.call(document.querySelectorAll('.fr-console-rack[data-app-ghost-panel], .fr-transport-bar[data-app-ghost-panel], .fr-scene-switcher[data-app-ghost-panel]'));
    var layerToggles = [];
    var layerSliders = [];
    var atmosphereInputs = Array.prototype.slice.call(document.querySelectorAll('[data-app-atmosphere]'));

    var codeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-code-file]'));
    var codePath = document.querySelector('[data-code-path]');
    var codeContent = document.querySelector('[data-code-content]');
    var codeStatus = document.querySelector('[data-code-status]');

    function audioAsset(relativePath) {
        return appendAssetVersion('swiftui-prototype/public/audio/' + relativePath);
    }

    function soundAsset(fileName) {
        return audioAsset('sound/' + fileName);
    }

    var AMBIENT_LAYER_LIBRARY = {
        piano: {
            label: 'Piano',
            hint: 'Warm keys',
            defaultEnabled: true,
            defaultVolume: 0.5,
            defaultTrack: 'last-night',
            gain: 1.12,
            previewVolume: 0.68,
            tracks: [
                { key: 'last-night', label: 'Last Night', src: soundAsset('piano-last-night.mp3'), previewStart: 3.55 },
                { key: 'barcarolle', label: 'June Barcarolle', src: soundAsset('tchaikovsky-june-barcarolle.mp3') },
                { key: 'autumn-memory', label: '秋的思念', src: audioAsset('piano/秋的思念.mp3') },
                { key: 'ocean-of-flowers', label: '花海', src: audioAsset('piano/花海.mp3') },
                { key: 'kikujiro-summer', label: '菊次郎的夏天', src: audioAsset('piano/菊次郎的夏天.mp3') },
                { key: 'those-years', label: '那些年', src: audioAsset('piano/那些年.mp3') },
                { key: 'summer', label: 'Summer', src: audioAsset('piano/summer.mp3') },
                { key: 'the-rain', label: 'The Rain', src: audioAsset('piano/The rain.mp3') },
                { key: 'true-happiness', label: '你不是真正的快乐', src: audioAsset('piano/你不是真正的快乐.mp3') },
                { key: 'quiet-afternoon', label: '安静的午后', src: audioAsset('piano/安静的午后.mp3') },
                { key: 'ming-ming-jiu', label: '明明就', src: audioAsset('piano/明明就.mp3') },
                { key: 'eternal-moment', label: '瞬间的永恒', src: audioAsset('piano/瞬间的永恒.mp3') }
            ]
        },
        rain: {
            label: 'Rain',
            hint: 'Weather field',
            defaultEnabled: true,
            defaultVolume: 0.4,
            defaultTrack: 'light-rain',
            gain: 0.82,
            previewVolume: 0.5,
            tracks: [
                { key: 'light-rain', label: 'Light Rain', src: soundAsset('light-rain.mp3') },
                { key: 'steady-rain', label: 'Steady Rain', src: soundAsset('steady-rain.mp3') },
                { key: 'rainfall-soft', label: 'Rainfall Soft', src: soundAsset('rainfall-soft.mp3') },
                { key: 'urban-rain', label: 'Urban Rain', src: soundAsset('urban-rain.mp3') },
                { key: 'urban-rain-alt', label: 'Urban Rain Alt', src: soundAsset('urban-rain-alt.mp3') },
                { key: 'house-rain', label: 'House Rain', src: soundAsset('bangkok-house-rain.mp3') },
                { key: 'parasol', label: 'Rain Parasol', src: soundAsset('rain-parasol.mp3') },
                { key: 'heavy-traffic', label: 'Heavy Rain Traffic', src: soundAsset('heavy-rain-traffic.mp3') }
            ]
        },
        wind: {
            label: 'Wind',
            hint: 'Cold air',
            defaultEnabled: true,
            defaultVolume: 0.48,
            defaultTrack: 'arctic-cold',
            gain: 1.16,
            previewVolume: 0.62,
            tracks: [
                { key: 'arctic-cold', label: 'Arctic Cold', src: soundAsset('arctic-cold-wind.mp3') },
                { key: 'arctic-cold-alt', label: 'Arctic Cold Alt', src: soundAsset('arctic-cold-wind-alt.mp3') }
            ]
        },
        presence: {
            label: 'Ambient Presence',
            hint: 'Anonymous signals',
            defaultEnabled: false,
            defaultVolume: 0.08,
            defaultTrack: 'soft-typing',
            gain: 0.56,
            previewVolume: 0.16,
            tracks: [
                { key: 'soft-typing', label: 'Soft Typing', src: audioAsset('keyboard_mouse/keyboard_typing_3.mp3'), previewStart: 4.2 },
                { key: 'light-typing', label: 'Light Keyboard', src: audioAsset('keyboard_mouse/keyboard_typing_2.mp3'), previewStart: 2.4 },
                { key: 'mechanical', label: 'Mechanical Keyboard', src: audioAsset('keyboard_mouse/mechanical_keyboard_typing_1.mp3'), previewStart: 5.8 },
                { key: 'mouse-clicks', label: 'Mouse Clicks', src: audioAsset('keyboard_mouse/mouse_click_sounds.mp3'), previewStart: 0.8 }
            ]
        },
        water: {
            label: 'Water',
            hint: 'Stream bed',
            defaultEnabled: false,
            defaultVolume: 0.28,
            defaultTrack: 'waves-hawaii',
            gain: 1.34,
            previewVolume: 0.64,
            tracks: [
                { key: 'mountain-stream', label: 'Mountain Stream', src: soundAsset('mountain-stream.mp3') },
                { key: 'waves-hawaii', label: 'Hawaii Waves', src: soundAsset('waves-hawaii.mp3') }
            ]
        },
        storm: {
            label: 'Storm',
            hint: 'Thunder field',
            defaultEnabled: false,
            defaultVolume: 0.16,
            defaultTrack: 'rain-thunder',
            gain: 1,
            previewVolume: 0.48,
            tracks: [
                { key: 'rain-thunder', label: 'Rain Thunder', src: soundAsset('rain-thunder-4.mp3') },
                { key: 'close-thunder', label: 'Close Thunder', src: soundAsset('thunder-close-rain.mp3') }
            ]
        },
        utility: {
            label: 'Utility',
            hint: 'Mechanical hush',
            defaultEnabled: false,
            defaultVolume: 0.08,
            defaultTrack: 'wall-clock',
            gain: 1,
            previewVolume: 0.46,
            tracks: [
                { key: 'wall-clock', label: 'Wall Clock', src: soundAsset('wall-clock-ticking.mp3') }
            ]
        },
        chime: {
            label: 'Chime',
            hint: 'Glass air',
            defaultEnabled: false,
            defaultVolume: 0.1,
            defaultTrack: 'glass-chimes',
            gain: 0.96,
            previewVolume: 0.44,
            tracks: [
                { key: 'glass-chimes', label: 'Glass Chimes', src: soundAsset('glass-chimes.mp3') },
                { key: 'wind-chimes-a', label: 'Wind Chimes A', src: soundAsset('wind-chimes-a.mp3') },
                { key: 'wind-chime-toll', label: 'Wind Chime Toll', src: soundAsset('wind-chime-toll.mp3') }
            ]
        }
    };
    var COMPLETION_CHIME_SOURCE = soundAsset('wind-chime-toll.mp3');
    var layerNames = Object.keys(AMBIENT_LAYER_LIBRARY);
    var layerDisplayNames = layerNames.reduce(function (map, layerName) {
        map[layerName] = AMBIENT_LAYER_LIBRARY[layerName].label;
        return map;
    }, {});
    var SCENE_VIDEO_DEFINITIONS = [
        { key: 'midnight', file: 'Windowlight at Midnight.mp4', sub: 'rain-lit glass / warm desk light' },
        { key: 'sanctuary', file: 'The Focus Sanctuary.mp4', sub: 'protected interior / slow quiet rain' },
        { key: 'coffee', file: 'Coffee at Midnight.mp4', sub: 'warm cafe shadows / soft city rain' },
        { key: 'calmCafe', file: 'The Calm Café.mp4', label: 'The Calm Cafe', sub: 'gentle amber / easier room tone' },
        { key: 'cloister', file: 'The Cloister Silence.mp4', sub: 'stone stillness / sacred quiet' },
        { key: 'library', file: 'The Library of Night.mp4', sub: 'quiet archive / deeper shadow' },
        { file: 'A Study in Motion.mp4' },
        { file: 'A Train Across Still Water.mp4' },
        { file: 'Above Distraction.mp4' },
        { file: 'Above the World A Study in Silence.mp4' },
        { file: 'Before Meaning.mp4' },
        { file: 'Before the Day Begins.mp4' },
        { file: 'Behind the Water.mp4' },
        { file: 'Between Lights and Silence.mp4' },
        { file: 'Black Marble Silence.mp4' },
        { file: 'Digital Stillness.mp4' },
        { file: 'Form and Silence.mp4' },
        { file: 'Noir Study The Silent Contract.mp4' },
        { file: 'Rain in the Attic.mp4' },
        { file: 'The Depths Are Watching.mp4' },
        { file: 'The Empty System.mp4' },
        { file: 'The Engineering Mind.mp4' },
        { file: 'The Infinite Archive.mp4' },
        { file: 'The Investigation Room.mp4' },
        { file: 'The Late Hour.mp4' },
        { file: 'The Library of Rules.mp4' },
        { file: 'The Luminous Study.mp4' },
        { file: 'The Natural State of Focus.mp4' },
        { file: 'The Room Beyond Time.mp4' },
        { file: 'The Shape of Quiet.mp4' },
        { file: 'The Sound of Rain on Stone.mp4' },
        { file: 'The Space Between Drops.mp4' },
        { file: 'The Unstable Horizon.mp4' },
        { file: 'The Way of Quiet Water.mp4' },
        { file: 'The Weight of Light.mp4' },
        { file: 'Where the Lanterns Remember.mp4' },
        { file: 'Where the Mist Lingers.mp4' },
        { file: 'Where the Star Breathes.mp4' },
        { file: 'Where Warmth Stays.mp4' }
    ];
    var sceneCatalog = buildSceneCatalog(SCENE_VIDEO_DEFINITIONS);
    var SCENE_VIDEOS = sceneCatalog.map;
    var SCENE_VIDEO_ORDER = sceneCatalog.order;
    var storageKey = 'focus-room.web-settings';
    var MODE_COPY = {
        focus: {
            title: 'Focus Room',
            entryDescription: 'A quiet room for deep work.',
            thresholdNote: 'Press and hold to let the room surface.',
            roomNote: 'Keep the room gentle. Start when the mix already feels right.'
        },
        writing: {
            title: 'Writing Room',
            entryDescription: 'An immersive writing surface inside the room.',
            thresholdNote: 'Hold to enter. The room will open onto a quiet page.',
            roomNote: 'Set a quiet intention, then let the room respond to how the draft is moving.'
        }
    };
    var WRITING_STATE_LABELS = {
        settling: 'Settling in',
        fluent: 'Fluent',
        reflective: 'Reflective',
        stuck: 'Stuck',
        deep: 'Deep focus'
    };
    var WRITING_WHISPERS = {
        settling: [
            'Let the sentence arrive.',
            'Begin with the line that already knows itself.',
            'One line is enough to continue.'
        ],
        fluent: [
            'Stay with the thought.',
            'Keep the line moving.',
            'Let momentum stay quiet.'
        ],
        reflective: [
            'Follow the softer detail.',
            'Stay close to what the sentence is noticing.',
            'The quieter line may be the true one.'
        ],
        stuck: [
            'One line is enough to continue.',
            'Ease the sentence down to its next honest shape.',
            'Stay with the thought.'
        ],
        deep: [
            'The room can hold the rest.',
            'Keep the page open a little longer.',
            'Let the draft deepen without forcing it.'
        ]
    };
    var WRITING_SENTIMENT_LEXICON = {
        positive: ['clear', 'calm', 'open', 'steady', 'good', 'warm', 'gentle', 'ready', 'trust', 'enough', 'bright', 'alive', 'flow', 'ease'],
        negative: ['stuck', 'hard', 'afraid', 'anxious', 'blocked', 'pressure', 'overwhelmed', 'worry', 'worried', "can't", 'cannot', 'late', 'behind', 'tense'],
        reflective: ['think', 'wonder', 'perhaps', 'maybe', 'listen', 'notice', 'remember', 'memory', 'quiet', 'slowly']
    };

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

    var appModeState = {
        mode: 'focus'
    };

    var sessionState = {
        selectedMinutes: 10,
        demoDurationMs: 600000,
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
        hasPrimedPlayback: false,
        previewLayer: '',
        previewRestoreAllowPreview: false,
        previewTimer: null,
        sessionRecoveryTimer: null,
        layers: {},
        completionChime: null,
        completionTimer: null
    };

    var atmosphereState = {
        warmth: 0.42,
        focusDepth: 0.36,
        fog: 0.28
    };

    var writingState = {
        task: '',
        content: '',
        wordCount: 0,
        typingCadence: 0,
        pauseMs: 0,
        deleteCount: 0,
        deletionRatio: 0,
        focusDurationMs: 0,
        sentimentScore: 0,
        inferredState: 'settling',
        startedAt: null
    };

    var writingRuntimeState = {
        activity: [],
        pauses: [],
        totalInserted: 0,
        totalDeleted: 0,
        lastInputAt: 0,
        lastEditorLength: 0,
        focusStartedAt: 0,
        accumulatedFocusMs: 0,
        autosaveTimer: null,
        pulseTimer: null,
        lastWhisperAt: 0,
        lastWhisperText: '',
        lastStateKey: 'settling'
    };

    var backgroundState = {
        descriptor: null,
        userSceneOverrideUntil: 0,
        lastSceneChangeAt: 0,
        lastDescriptorKey: ''
    };

    var sceneSwitcherState = {
        expanded: true
    };

    var layerTrackState = {};
    var layerExpandedState = {};
    var layerDrawerState = {
        openLayer: ''
    };

    var visualState = {
        progress: 0,
        lampWarmthBoost: 0,
        rainDensityBoost: 0,
        consoleDim: 0.08,
        hudFade: 1
    };

    var presenceState = {
        sessionId: '',
        heartbeatTimer: null,
        pending: null,
        reportedCount: 28,
        count: 36,
        targetCount: 36,
        nextCountShiftAt: 0,
        nextCountStepAt: 0,
        sceneKey: 'midnight',
        activity: 0.26,
        pulseMs: 5600,
        source: 'signal',
        enteredLast10m: 12,
        recentAction: 'Someone returned to their work'
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

    function getLayerConfig(layerName) {
        return AMBIENT_LAYER_LIBRARY[layerName] || null;
    }

    function getLayerDisplayName(layerName) {
        return layerDisplayNames[layerName] || (layerName.charAt(0).toUpperCase() + layerName.slice(1));
    }

    function getLayerTrack(layerName, trackKey) {
        var config = getLayerConfig(layerName);
        var match = null;

        if (!config) {
            return null;
        }

        config.tracks.some(function (track) {
            if (track.key === trackKey) {
                match = track;
                return true;
            }

            return false;
        });

        return match || config.tracks[0] || null;
    }

    function getSelectedLayerTrack(layerName) {
        var config = getLayerConfig(layerName);

        if (!config) {
            return null;
        }

        return getLayerTrack(layerName, layerTrackState[layerName] || config.defaultTrack);
    }

    function getLayerSelectionLabel(layerName) {
        var config = getLayerConfig(layerName);
        var selectedTrack = getSelectedLayerTrack(layerName);
        var variantCount = config && config.tracks ? config.tracks.length : 0;

        if (!selectedTrack) {
            return 'No track';
        }

        return selectedTrack.label + ' · ' + variantCount + ' sound' + (variantCount === 1 ? '' : 's');
    }

    function getLayerExpandLabel(layerName, isExpanded) {
        var config = getLayerConfig(layerName);
        var variantCount = config && config.tracks ? config.tracks.length : 0;

        if (isExpanded) {
            return 'Hide';
        }

        return variantCount + ' sound' + (variantCount === 1 ? '' : 's');
    }

    function getLayerOutputGain(layerName) {
        var config = getLayerConfig(layerName);
        return clamp(config && typeof config.gain === 'number' ? config.gain : 1, 0.2, 2);
    }

    function getEffectiveLayerVolume(layerName, volume) {
        return clamp((Number(volume) || 0) * getLayerOutputGain(layerName), 0, 1);
    }

    function getLayerPreviewVolume(layerName) {
        var config = getLayerConfig(layerName);
        var layerState = getLayerState(layerName);
        var basePreview = config && typeof config.previewVolume === 'number'
            ? config.previewVolume
            : Math.max(layerState.volume, 0.58);

        return getEffectiveLayerVolume(layerName, basePreview);
    }

    function syncLayerPreviewUI() {
        layerNames.forEach(function (layerName) {
            var isPreviewing = audioState.previewLayer === layerName;
            var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-app-layer-preview="' + layerName + '"]'));

            buttons.forEach(function (button) {
                button.classList.toggle('is-previewing', isPreviewing);
                button.setAttribute('aria-pressed', isPreviewing ? 'true' : 'false');
                button.textContent = isPreviewing ? 'Previewing' : 'Preview';
            });
        });
    }

    function renderLayerDrawer(layerName) {
        var config = getLayerConfig(layerName);
        var selectedTrack = getSelectedLayerTrack(layerName);

        if (!layerDrawer || !layerDrawerTracks || !config) {
            return;
        }

        layerDrawerState.openLayer = layerName;
        layerDrawer.setAttribute('data-layer-name', layerName);

        if (layerDrawerTitle) {
            layerDrawerTitle.textContent = config.label;
        }

        if (layerDrawerMeta) {
            layerDrawerMeta.textContent = config.tracks.length + ' sound' + (config.tracks.length === 1 ? '' : 's') + ' available';
        }

        layerDrawerTracks.innerHTML = config.tracks.map(function (track) {
            var isActive = !!(selectedTrack && selectedTrack.key === track.key);

            return '<button class="fr-track-chip' + (isActive ? ' is-active' : '') + '" data-app-layer-track="' + layerName + '" data-track-key="' + track.key + '" type="button" aria-pressed="' + (isActive ? 'true' : 'false') + '">' + track.label + '</button>';
        }).join('');

        setHidden(layerDrawer, false);
    }

    function closeLayerDrawer() {
        layerDrawerState.openLayer = '';

        if (layerDrawer) {
            layerDrawer.removeAttribute('data-layer-name');
            setHidden(layerDrawer, true);
        }
    }

    function syncLayerExpandUI() {
        if (appMixerPanel) {
            appMixerPanel.classList.toggle('is-layer-drawer-open', !!layerDrawerState.openLayer);
        }

        layerNames.forEach(function (layerName) {
            var isExpanded = layerDrawerState.openLayer === layerName;
            var card = document.querySelector('[data-app-layer-card="' + layerName + '"]');
            var button = document.querySelector('[data-app-layer-expand="' + layerName + '"]');

            layerExpandedState[layerName] = isExpanded;

            if (card) {
                card.classList.toggle('is-expanded', isExpanded);
                card.setAttribute('data-layer-expanded', isExpanded ? 'true' : 'false');
            }

            if (button) {
                button.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
                button.textContent = getLayerExpandLabel(layerName, isExpanded);
            }
        });

        if (layerDrawerState.openLayer) {
            renderLayerDrawer(layerDrawerState.openLayer);
        } else {
            closeLayerDrawer();
        }
    }

    function refreshLayerControlRefs() {
        layerToggles = Array.prototype.slice.call(document.querySelectorAll('[data-app-layer-toggle]'));
        layerSliders = Array.prototype.slice.call(document.querySelectorAll('[data-app-layer-volume]'));
    }

    function renderLayerStripList() {
        if (!layerList) {
            return;
        }

        var currentLayerSettings = {};

        layerNames.forEach(function (layerName) {
            var config = getLayerConfig(layerName);
            var elements = getLayerElements(layerName);

            currentLayerSettings[layerName] = {
                enabled: elements.toggle ? !!elements.toggle.checked : !!config.defaultEnabled,
                volume: elements.slider ? clamp(Number(elements.slider.value || '0'), 0, 1) : clamp(Number(config.defaultVolume || 0), 0, 1)
            };
        });

        layerList.innerHTML = '';

        layerNames.forEach(function (layerName) {
            var config = getLayerConfig(layerName);
            var selectedTrack = getSelectedLayerTrack(layerName);
            var layerSetting = currentLayerSettings[layerName] || {
                enabled: !!config.defaultEnabled,
                volume: clamp(Number(config.defaultVolume || 0), 0, 1)
            };
            var defaultVolume = layerSetting.volume;
            var card = document.createElement('section');

            card.className = 'fr-channel-strip';
            card.setAttribute('data-app-layer-card', layerName);
            card.setAttribute('data-layer-expanded', 'false');
            card.innerHTML = '' +
                '<div class="fr-channel-strip__top">' +
                    '<div class="fr-channel-strip__copy">' +
                        '<span class="fr-channel-strip__name">' + config.label + '</span>' +
                        '<span class="fr-channel-strip__hint">' + config.hint + '</span>' +
                    '</div>' +
                    '<div class="fr-channel-strip__actions">' +
                        '<label class="fr-console-mini-toggle">' +
                            '<input ' + (layerSetting.enabled ? 'checked ' : '') + 'data-app-layer-toggle="' + layerName + '" type="checkbox" role="switch" aria-checked="' + (layerSetting.enabled ? 'true' : 'false') + '" aria-label="Toggle ' + config.label + ' layer">' +
                            '<span></span>' +
                        '</label>' +
                        '<button class="fr-channel-strip__preview" data-app-layer-preview="' + layerName + '" type="button" aria-pressed="false">Preview</button>' +
                        '<button class="fr-channel-strip__expand" data-app-layer-expand="' + layerName + '" type="button" aria-expanded="false" aria-controls="frLayerDrawer">' + getLayerExpandLabel(layerName, false) + '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="fr-channel-strip__selection" data-app-layer-track-label="' + layerName + '">' + getLayerSelectionLabel(layerName) + '</div>' +
                '<div class="fr-channel-strip__bar">' +
                    '<div class="fr-channel-strip__meter" aria-hidden="true"></div>' +
                    '<div class="fr-channel-strip__fader">' +
                        '<input class="fr-console-fader" data-app-layer-volume="' + layerName + '" max="1" min="0" step="0.01" type="range" value="' + defaultVolume.toFixed(2) + '" aria-label="' + config.label + ' level">' +
                    '</div>' +
                    '<div class="fr-channel-strip__value" data-app-layer-value="' + layerName + '">' + formatPercent(defaultVolume) + '</div>' +
                '</div>';

            layerList.appendChild(card);
        });

        refreshLayerControlRefs();

        layerNames.forEach(function (layerName) {
            syncLayerTrackUI(layerName);
        });

        syncLayerPreviewUI();
        syncLayerExpandUI();
    }

    function syncLayerTrackUI(layerName) {
        var selectedTrack = getSelectedLayerTrack(layerName);
        var labelNode = document.querySelector('[data-app-layer-track-label="' + layerName + '"]');
        var trackButtons = Array.prototype.slice.call(document.querySelectorAll('[data-app-layer-track="' + layerName + '"]'));

        if (labelNode) {
            labelNode.textContent = getLayerSelectionLabel(layerName);
        }

        trackButtons.forEach(function (button) {
            var isActive = !!(selectedTrack && button.getAttribute('data-track-key') === selectedTrack.key);
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (layerDrawerState.openLayer === layerName) {
            renderLayerDrawer(layerName);
        }
    }

    function setLayerExpanded(layerName, shouldExpand) {
        if (!layerName) {
            closeLayerDrawer();
            syncLayerExpandUI();
            return;
        }

        layerDrawerState.openLayer = shouldExpand ? layerName : '';
        syncLayerExpandUI();

        if (shouldExpand) {
            revealLayerCard(layerName);
        }
    }

    function toggleLayerExpanded(layerName) {
        setLayerExpanded(layerName, layerDrawerState.openLayer !== layerName);
    }

    function revealLayerCard(layerName) {
        if (!layerList) {
            return;
        }

        var card = document.querySelector('[data-app-layer-card="' + layerName + '"]');

        if (!card) {
            return;
        }

        var ensureVisible = function () {
            var containerRect = layerList.getBoundingClientRect();
            var cardRect = card.getBoundingClientRect();
            var topOverflow = cardRect.top - containerRect.top;
            var bottomOverflow = cardRect.bottom - containerRect.bottom;

            if (topOverflow < 0) {
                layerList.scrollTop += topOverflow - 12;
            }

            if (bottomOverflow > 0) {
                layerList.scrollTop += bottomOverflow + 20;
            }
        };

        window.requestAnimationFrame(function () {
            ensureVisible();

            window.setTimeout(function () {
                ensureVisible();
            }, prefersReducedMotion() ? 0 : 120);
        });
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

    function getAudibleLayerNames() {
        return layerNames.filter(function (layerName) {
            var layerState = getLayerState(layerName);
            return layerState.enabled && layerState.volume > 0.001;
        });
    }

    function reviveEnabledMutedLayers() {
        var revivedAny = false;

        layerNames.forEach(function (layerName) {
            var elements = getLayerElements(layerName);
            var config = getLayerConfig(layerName);
            var defaultVolume = clamp(Number(config && config.defaultVolume ? config.defaultVolume : 0.35), 0.08, 1);

            if (!elements.toggle || !elements.slider || !elements.toggle.checked) {
                return;
            }

            if (Number(elements.slider.value || '0') > 0.001) {
                return;
            }

            elements.slider.value = defaultVolume.toFixed(2);
            syncLayerVisual(layerName);
            revivedAny = true;
        });

        if (!revivedAny) {
            return false;
        }

        updateMixSummary();
        updateRoomNote();
        saveSettings();
        return true;
    }

    function findLayerEventTarget(event, attributeName) {
        var target = event ? event.target : null;

        if (!target || target.nodeType !== 1) {
            return null;
        }

        if (target.hasAttribute(attributeName)) {
            return target;
        }

        return typeof target.closest === 'function' ? target.closest('[' + attributeName + ']') : null;
    }

    function handleLayerToggleChange(layerName) {
        stopLayerPreview(true);
        registerAudioInteraction();
        reviveEnabledMutedLayers();
        syncLayerVisual(layerName);
        syncLayerAudio(layerName, {
            duration: 360,
            allowPreview: sessionState.running,
            resetOnPause: false
        });
        saveSettings();
        updateMixSummary();
        updateRoomNote();
        renderPresence(makeFallbackPresenceSnapshot(Date.now()));
        wakeGhostUI();
    }

    function handleLayerVolumeChange(layerName) {
        stopLayerPreview(true);
        registerAudioInteraction();
        syncLayerVisual(layerName);
        syncLayerAudio(layerName, {
            duration: 160,
            allowPreview: sessionState.running,
            resetOnPause: false
        });
        saveSettings();
        updateMixSummary();
        updateRoomNote();
        renderPresence(makeFallbackPresenceSnapshot(Date.now()));
        wakeGhostUI();
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

    function setSceneSwitcherExpanded(shouldExpand) {
        var isExpanded = !!shouldExpand;

        sceneSwitcherState.expanded = isExpanded;

        if (sceneSwitcher) {
            sceneSwitcher.setAttribute('data-scene-switcher-open', isExpanded ? 'true' : 'false');
        }

        if (sceneSwitcherBody) {
            setHidden(sceneSwitcherBody, !isExpanded);
        }

        if (sceneSwitcherToggle) {
            sceneSwitcherToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            sceneSwitcherToggle.textContent = isExpanded ? 'Hide' : 'Rooms';
            sceneSwitcherToggle.setAttribute('aria-label', isExpanded ? 'Hide scene library' : 'Show scene library');
        }
    }

    function toggleSceneSwitcher() {
        setSceneSwitcherExpanded(!sceneSwitcherState.expanded);
    }

    function setSceneVideo(sceneKey, shouldSave) {
        var nextKey = Object.prototype.hasOwnProperty.call(SCENE_VIDEOS, sceneKey) ? sceneKey : 'midnight';
        var scene = SCENE_VIDEOS[nextKey];

        sessionState.sceneKey = nextKey;

        if (sceneStage) {
            sceneStage.setAttribute('data-scene-active', nextKey);
        }

        sceneButtons.forEach(function (button) {
            var isActive = button.getAttribute('data-scene-key') === nextKey;

            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (appSceneLabel) {
            appSceneLabel.textContent = scene.label;
        }

        if (appSceneSub) {
            appSceneSub.textContent = scene.sub;
        }

        if (sceneSwitcherActive) {
            sceneSwitcherActive.textContent = scene.label;
            sceneSwitcherActive.title = scene.label;
        }

        if (sceneVideo && sceneSource) {
            if (sceneSource.getAttribute('src') !== scene.src) {
                sceneSource.setAttribute('src', scene.src);
                sceneVideo.load();
            }

            sceneVideo.setAttribute('aria-label', scene.label);
        }

        syncSceneVideoPlayback();
        renderPresence(makeFallbackPresenceSnapshot(Date.now()));

        if (shouldSave) {
            saveSettings();
        }
    }

    function renderSceneButtons() {
        if (!sceneGrid) {
            return;
        }

        sceneGrid.innerHTML = '';
        sceneButtons = [];

        SCENE_VIDEO_ORDER.forEach(function (key) {
            var scene = SCENE_VIDEOS[key];
            var button = document.createElement('button');

            if (!scene) {
                return;
            }

            button.type = 'button';
            button.className = 'fr-scene-chip';
            button.setAttribute('data-scene-key', key);
            button.setAttribute('aria-pressed', 'false');
            button.textContent = scene.label;
            button.title = scene.label;
            sceneGrid.appendChild(button);
            sceneButtons.push(button);
        });
    }

    function getModeCopy(mode) {
        return MODE_COPY[mode] || MODE_COPY.focus;
    }

    function getWritingStateLabel(stateKey) {
        return WRITING_STATE_LABELS[stateKey] || WRITING_STATE_LABELS.settling;
    }

    function tokenizeWritingText(text) {
        return normalizeWritingText(text).toLowerCase().match(/[a-z0-9\u00c0-\u024f']+/g) || [];
    }

    function countLexiconHits(tokens, lexicon) {
        return tokens.reduce(function (total, token) {
            return total + (lexicon.indexOf(token) !== -1 ? 1 : 0);
        }, 0);
    }

    function readWritingEditorText() {
        if (!writingEditor) {
            return writingState.content;
        }

        var raw = typeof writingEditor.innerText === 'string'
            ? writingEditor.innerText
            : (writingEditor.textContent || '');
        var normalized = normalizeWritingText(raw);

        return normalized.trim() ? normalized : '';
    }

    function setWritingEditorText(text) {
        if (!writingEditor) {
            return;
        }

        writingEditor.textContent = text || '';
        writingRuntimeState.lastEditorLength = text ? text.length : 0;
    }

    function placeCaretAtEnd(element) {
        if (!element || !window.getSelection || !document.createRange) {
            return;
        }

        var range = document.createRange();
        var selection = window.getSelection();

        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function insertPlainTextAtCursor(text) {
        if (!writingEditor || !window.getSelection || !document.createRange) {
            return;
        }

        var selection = window.getSelection();
        var safeText = String(text || '');

        if (!selection.rangeCount) {
            writingEditor.appendChild(document.createTextNode(safeText));
            placeCaretAtEnd(writingEditor);
            return;
        }

        var range = selection.getRangeAt(0);
        range.deleteContents();

        var textNode = document.createTextNode(safeText);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
    }

    function queueWritingAutosave() {
        window.clearTimeout(writingRuntimeState.autosaveTimer);
        writingRuntimeState.autosaveTimer = window.setTimeout(function () {
            saveSettings();
        }, 260);
    }

    function pruneWritingRuntimeBuffers(now) {
        writingRuntimeState.activity = writingRuntimeState.activity.filter(function (sample) {
            return now - sample.time <= 180000;
        });

        writingRuntimeState.pauses = writingRuntimeState.pauses.filter(function (sample) {
            return now - sample.time <= 180000;
        });
    }

    function recordWritingActivity(now, inserted, deleted) {
        if (!inserted && !deleted) {
            return;
        }

        writingRuntimeState.activity.push({
            time: now,
            inserted: inserted,
            deleted: deleted
        });
        writingRuntimeState.totalInserted += inserted;
        writingRuntimeState.totalDeleted += deleted;
        pruneWritingRuntimeBuffers(now);
    }

    function getWritingFocusDuration(now) {
        var total = writingRuntimeState.accumulatedFocusMs;

        if (writingRuntimeState.focusStartedAt) {
            total += now - writingRuntimeState.focusStartedAt;
        }

        return total;
    }

    function computeWritingSentimentScore(text) {
        var tokens = tokenizeWritingText(text);

        if (!tokens.length) {
            return 0;
        }

        var positiveHits = countLexiconHits(tokens, WRITING_SENTIMENT_LEXICON.positive);
        var negativeHits = countLexiconHits(tokens, WRITING_SENTIMENT_LEXICON.negative);
        var weighted = positiveHits - (negativeHits * 1.1);

        return clamp(weighted / Math.max(4, positiveHits + negativeHits + 1), -1, 1);
    }

    function computeWritingReflectiveWeight(text) {
        var tokens = tokenizeWritingText(text);

        if (!tokens.length) {
            return 0;
        }

        return countLexiconHits(tokens, WRITING_SENTIMENT_LEXICON.reflective) / tokens.length;
    }

    function inferWritingState(reflectiveWeight) {
        var cadence = writingState.typingCadence;
        var pauseMs = writingState.pauseMs;
        var deletionRatio = writingState.deletionRatio;
        var focusDurationMs = writingState.focusDurationMs;
        var wordCount = writingState.wordCount;
        var sentimentScore = writingState.sentimentScore;

        if (!wordCount && !writingState.task.trim()) {
            return 'settling';
        }

        if (wordCount < 18 && focusDurationMs < 90000) {
            return 'settling';
        }

        if (focusDurationMs > 360000 && cadence >= 70 && cadence <= 260 && pauseMs < 5200 && deletionRatio < 0.15) {
            return 'deep';
        }

        if (pauseMs > 12000 || deletionRatio > 0.34 || (focusDurationMs > 120000 && cadence < 26)) {
            return 'stuck';
        }

        if (cadence >= 110 && pauseMs < 3200 && deletionRatio < 0.18 && sentimentScore > -0.45) {
            return 'fluent';
        }

        if (reflectiveWeight > 0.08 || pauseMs > 4200 || sentimentScore < -0.2) {
            return 'reflective';
        }

        if (cadence < 60 && focusDurationMs < 180000) {
            return 'settling';
        }

        return cadence > 90 ? 'fluent' : 'reflective';
    }

    function updateWritingStatusUI() {
        if (writingWordCount) {
            writingWordCount.textContent = formatWordCount(writingState.wordCount);
        }

        if (writingCadence) {
            writingCadence.textContent = Math.max(0, Math.round(writingState.typingCadence)) + ' cpm';
        }

        if (writingStateLabel) {
            writingStateLabel.textContent = getWritingStateLabel(writingState.inferredState);
        }

        if (writingShell) {
            writingShell.setAttribute('data-writing-state', writingState.inferredState);
        }

        if (appRoomShell) {
            appRoomShell.setAttribute('data-writing-state', writingState.inferredState);
        }
    }

    function pickWritingWhisper() {
        var pool = WRITING_WHISPERS[writingState.inferredState] || WRITING_WHISPERS.settling;
        var seed = Math.max(0, writingState.wordCount + Math.round(writingState.focusDurationMs / 1000) + writingRuntimeState.totalDeleted);
        var choice = pool[seed % pool.length];

        if (pool.length > 1 && choice === writingRuntimeState.lastWhisperText) {
            choice = pool[(seed + 1) % pool.length];
        }

        return choice;
    }

    function maybeUpdateWritingWhisper(force, stateChanged) {
        if (!writingWhisper) {
            return;
        }

        var now = performance.now();
        var longPause = writingState.pauseMs > 9000;
        var enoughTimePassed = now - writingRuntimeState.lastWhisperAt > (stateChanged ? 14000 : 24000);

        if (!force && !longPause && !stateChanged) {
            return;
        }

        if (!force && !enoughTimePassed) {
            return;
        }

        var nextWhisper = pickWritingWhisper();

        if (!force && nextWhisper === writingRuntimeState.lastWhisperText) {
            return;
        }

        writingRuntimeState.lastWhisperAt = now;
        writingRuntimeState.lastWhisperText = nextWhisper;
        writingWhisper.textContent = nextWhisper;
    }

    function createMockBackgroundProvider() {
        var profiles = {
            settling: {
                key: 'settling',
                label: 'Room settling around the page',
                sceneKey: 'midnight',
                visual: {
                    clarity: 0.48,
                    softness: 0.38,
                    support: 0.18,
                    focusDepth: 0,
                    roomCalm: 0.02,
                    videoBrightness: 0.01,
                    videoContrast: 0.01,
                    videoSaturation: 0.01,
                    videoZoom: 0.001,
                    fogOverlay: 0.02,
                    warmthOverlay: 0.04,
                    glassOverlay: 0.01
                }
            },
            fluent: {
                key: 'fluent',
                label: 'Room opening with fluent lines',
                sceneKey: 'sanctuary',
                visual: {
                    clarity: 0.82,
                    softness: 0.18,
                    support: 0.12,
                    focusDepth: 0.03,
                    roomCalm: 0.04,
                    videoBrightness: 0.05,
                    videoContrast: 0.04,
                    videoSaturation: 0.04,
                    videoZoom: 0.003,
                    fogOverlay: -0.04,
                    warmthOverlay: 0.03,
                    glassOverlay: -0.01
                }
            },
            reflective: {
                key: 'reflective',
                label: 'Room diffusing into reflection',
                sceneKey: 'the-shape-of-quiet',
                visual: {
                    clarity: 0.56,
                    softness: 0.46,
                    support: 0.24,
                    focusDepth: 0.01,
                    roomCalm: 0.06,
                    videoBrightness: 0.01,
                    videoContrast: 0,
                    videoSaturation: 0.01,
                    videoZoom: 0.002,
                    fogOverlay: 0.05,
                    warmthOverlay: 0.08,
                    glassOverlay: 0.03
                }
            },
            stuck: {
                key: 'stuck',
                label: 'Room softening pressure',
                sceneKey: 'where-warmth-stays',
                visual: {
                    clarity: 0.36,
                    softness: 0.58,
                    support: 0.44,
                    focusDepth: -0.02,
                    roomCalm: 0.1,
                    videoBrightness: -0.01,
                    videoContrast: -0.02,
                    videoSaturation: 0.02,
                    videoZoom: 0,
                    fogOverlay: 0.08,
                    warmthOverlay: 0.14,
                    glassOverlay: 0.02
                }
            },
            deep: {
                key: 'deep',
                label: 'Room earning deep focus',
                sceneKey: 'library',
                visual: {
                    clarity: 0.9,
                    softness: 0.16,
                    support: 0.08,
                    focusDepth: 0.08,
                    roomCalm: -0.04,
                    videoBrightness: 0.08,
                    videoContrast: 0.07,
                    videoSaturation: 0.03,
                    videoZoom: 0.006,
                    fogOverlay: -0.05,
                    warmthOverlay: 0.06,
                    glassOverlay: 0.04
                }
            }
        };

        return {
            mode: 'mock',
            generateSceneDescriptor: function (context) {
                var base = profiles[context.inferredState] || profiles.settling;
                var sentimentLift = clamp(context.sentimentScore * 0.08, -0.06, 0.06);
                var supportLift = context.sentimentScore < 0 ? Math.abs(context.sentimentScore) * 0.12 : 0;
                var sceneKey = Object.prototype.hasOwnProperty.call(SCENE_VIDEOS, base.sceneKey) ? base.sceneKey : 'midnight';

                return {
                    provider: 'mock',
                    key: base.key + (sentimentLift > 0.02 ? '-lift' : (sentimentLift < -0.02 ? '-hush' : '')),
                    label: base.label,
                    sceneKey: sceneKey,
                    shouldSwitchScene: context.wordCount > 18,
                    visual: {
                        clarity: clamp(base.visual.clarity + sentimentLift, 0.24, 0.94),
                        softness: clamp(base.visual.softness + (context.sentimentScore < 0 ? 0.04 : 0) - sentimentLift * 0.24, 0.12, 0.66),
                        support: clamp(base.visual.support + supportLift, 0.08, 0.56),
                        focusDepth: base.visual.focusDepth,
                        roomCalm: base.visual.roomCalm,
                        videoBrightness: base.visual.videoBrightness + sentimentLift * 0.42,
                        videoContrast: base.visual.videoContrast + sentimentLift * 0.32,
                        videoSaturation: base.visual.videoSaturation + sentimentLift * 0.24,
                        videoZoom: base.visual.videoZoom,
                        fogOverlay: base.visual.fogOverlay - sentimentLift * 0.18,
                        warmthOverlay: base.visual.warmthOverlay + supportLift * 0.28,
                        glassOverlay: base.visual.glassOverlay
                    }
                };
            },
            applySceneDescriptor: function (descriptor, options) {
                var config = options || {};
                var now = performance.now();
                var canAutoSwitch = !!(descriptor && descriptor.shouldSwitchScene && appState.phase === 'room' && appModeState.mode === 'writing');
                var previousDescriptorKey = backgroundState.lastDescriptorKey;

                backgroundState.descriptor = descriptor;
                backgroundState.lastDescriptorKey = descriptor ? descriptor.key : '';

                if (sceneStage) {
                    if (descriptor) {
                        sceneStage.setAttribute('data-writing-descriptor', descriptor.key);
                    } else {
                        sceneStage.removeAttribute('data-writing-descriptor');
                    }
                }

                if (appRoomShell) {
                    if (descriptor) {
                        appRoomShell.setAttribute('data-writing-descriptor', descriptor.key);
                    } else {
                        appRoomShell.removeAttribute('data-writing-descriptor');
                    }
                }

                if (!canAutoSwitch || config.allowSceneSwitch === false || !descriptor || !descriptor.sceneKey) {
                    return;
                }

                if (backgroundState.userSceneOverrideUntil > now) {
                    return;
                }

                if (descriptor.sceneKey === sessionState.sceneKey) {
                    return;
                }

                if (now - backgroundState.lastSceneChangeAt < 18000 && previousDescriptorKey === descriptor.key) {
                    return;
                }

                backgroundState.lastSceneChangeAt = now;
                setSceneVideo(descriptor.sceneKey, false);
            }
        };
    }

    var backgroundProvider = createMockBackgroundProvider();

    function updateWritingEnvironment(options) {
        var config = options || {};
        var descriptor = backgroundProvider.generateSceneDescriptor({
            task: writingState.task,
            content: writingState.content,
            wordCount: writingState.wordCount,
            typingCadence: writingState.typingCadence,
            pauseMs: writingState.pauseMs,
            deleteCount: writingState.deleteCount,
            deletionRatio: writingState.deletionRatio,
            focusDurationMs: writingState.focusDurationMs,
            sentimentScore: writingState.sentimentScore,
            inferredState: writingState.inferredState
        });

        backgroundProvider.applySceneDescriptor(descriptor, config);
        applyAtmosphereFromConsole();
    }

    function syncWritingShellVisibility() {
        if (!writingShell) {
            return;
        }

        var shouldShow = appState.phase === 'room' && appModeState.mode === 'writing';
        setHidden(writingShell, !shouldShow);
        writingShell.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    }

    function syncModePresentation() {
        var copy = getModeCopy(appModeState.mode);

        if (appRoomTitle) {
            appRoomTitle.textContent = copy.title;
        }

        if (appEntryTitle) {
            appEntryTitle.textContent = copy.title;
        }

        if (appEntryDescription) {
            appEntryDescription.textContent = copy.entryDescription;
        }

        if (appTopbarNote) {
            appTopbarNote.textContent = appState.phase === 'room' ? copy.roomNote : copy.thresholdNote;
        }

        if (appRoomShell) {
            appRoomShell.setAttribute('data-app-mode', appModeState.mode);
        }

        appModeButtons.forEach(function (button) {
            var isActive = button.getAttribute('data-app-mode-control') === appModeState.mode;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        syncWritingShellVisibility();

        if (appState.phase === 'threshold') {
            setThresholdPromptCopy();
        }
    }

    function refreshWritingMetrics(options) {
        var config = options || {};
        var now = typeof config.now === 'number' ? config.now : performance.now();
        var previousState = writingState.inferredState;
        var cadenceWindowMs = 30000;
        var deletionWindowMs = 90000;
        var recentInserted = 0;
        var recentDeleted = 0;
        var reflectiveWeight;
        var combinedText;

        pruneWritingRuntimeBuffers(now);

        writingState.wordCount = countWords(writingState.content);
        writingState.pauseMs = writingRuntimeState.lastInputAt ? now - writingRuntimeState.lastInputAt : 0;
        writingState.focusDurationMs = getWritingFocusDuration(now);
        writingState.deleteCount = writingRuntimeState.totalDeleted;

        writingRuntimeState.activity.forEach(function (sample) {
            if (now - sample.time <= cadenceWindowMs) {
                recentInserted += sample.inserted;
            }

            if (now - sample.time <= deletionWindowMs) {
                recentDeleted += sample.deleted;
            }
        });

        writingState.typingCadence = Math.round((recentInserted / cadenceWindowMs) * 60000);
        writingState.deletionRatio = clamp(recentDeleted / Math.max(1, recentInserted + recentDeleted), 0, 1);

        combinedText = [writingState.task, writingState.content].filter(Boolean).join('\n');
        writingState.sentimentScore = computeWritingSentimentScore(combinedText);
        reflectiveWeight = computeWritingReflectiveWeight(combinedText);
        writingState.inferredState = inferWritingState(reflectiveWeight);

        updateWritingStatusUI();
        maybeUpdateWritingWhisper(config.forceWhisper || !writingRuntimeState.lastWhisperText, previousState !== writingState.inferredState);
        updateWritingEnvironment({
            allowSceneSwitch: config.allowSceneSwitch
        });

        if (previousState !== writingState.inferredState || config.forceRoomNote) {
            updateRoomNote();
        }

        writingRuntimeState.lastStateKey = writingState.inferredState;
    }

    function syncWritingInputsFromState() {
        if (writingTaskInput) {
            writingTaskInput.value = writingState.task;
        }

        setWritingEditorText(writingState.content);
        updateWritingStatusUI();
    }

    function setAppMode(mode, options) {
        var config = options || {};
        var nextMode = mode === 'writing' ? 'writing' : 'focus';
        var activeElement = document.activeElement;

        if (appModeState.mode !== nextMode) {
            appModeState.mode = nextMode;
        }

        if (nextMode !== 'writing') {
            commitWritingFocusDuration();

            if (activeElement === writingEditor || activeElement === writingTaskInput) {
                if (appStartButton && appState.phase === 'room') {
                    appStartButton.focus();
                }
            }
        }

        if (nextMode === 'writing') {
            setSceneSwitcherExpanded(false);
        } else if (appState.phase === 'room') {
            setSceneSwitcherExpanded(defaultSceneSwitcherExpanded());
        }

        syncModePresentation();
        refreshWritingMetrics({
            allowSceneSwitch: config.allowSceneSwitch,
            forceWhisper: config.forceWhisper,
            forceRoomNote: true
        });
        refreshPresence({
            force: true
        });

        if (config.focusSurface && nextMode === 'writing') {
            window.setTimeout(function () {
                focusWritingSurface();
            }, prefersReducedMotion() ? 0 : 50);
        }

        if (config.save !== false) {
            saveSettings();
        }
    }

    function focusWritingSurface() {
        if (!appState.isOpen || appState.phase !== 'room' || appModeState.mode !== 'writing') {
            return;
        }

        if (writingTaskInput && !writingState.task.trim()) {
            writingTaskInput.focus();
            return;
        }

        if (writingEditor) {
            writingEditor.focus();
            placeCaretAtEnd(writingEditor);
        }
    }

    function commitWritingFocusDuration() {
        if (!writingRuntimeState.focusStartedAt) {
            return;
        }

        writingRuntimeState.accumulatedFocusMs += performance.now() - writingRuntimeState.focusStartedAt;
        writingRuntimeState.focusStartedAt = 0;
    }

    function beginWritingFocus() {
        if (writingRuntimeState.focusStartedAt) {
            return;
        }

        if (!writingState.startedAt) {
            writingState.startedAt = performance.now();
        }

        writingRuntimeState.focusStartedAt = performance.now();
    }

    function handleWritingTaskInput() {
        writingState.task = normalizeWritingText(writingTaskInput ? writingTaskInput.value : '');
        queueWritingAutosave();
        refreshWritingMetrics({
            allowSceneSwitch: false,
            forceRoomNote: true
        });
        wakeGhostUI();
    }

    function handleWritingEditorFocus() {
        beginWritingFocus();
        wakeGhostUI(2200);
    }

    function handleWritingEditorBlur() {
        commitWritingFocusDuration();
        refreshWritingMetrics({
            allowSceneSwitch: false
        });
    }

    function handleWritingEditorKeydown(event) {
        if (!event) {
            return;
        }

        if (event.key === 'Tab') {
            event.preventDefault();
            event.stopPropagation();
            insertPlainTextAtCursor('    ');
            handleWritingEditorInput({ inputType: 'insertText' });
            return;
        }

        wakeGhostUI(2200);
    }

    function handleWritingEditorPaste(event) {
        if (!event || !event.clipboardData) {
            return;
        }

        event.preventDefault();
        insertPlainTextAtCursor(event.clipboardData.getData('text/plain'));
        handleWritingEditorInput({ inputType: 'insertFromPaste' });
    }

    function handleWritingEditorInput(event) {
        var now = performance.now();
        var inputType = event && typeof event.inputType === 'string' ? event.inputType : '';
        var nextContent = readWritingEditorText();
        var previousLength = writingState.content.length;
        var nextLength = nextContent.length;
        var lengthDelta = nextLength - previousLength;
        var inserted = 0;
        var deleted = 0;

        if (!writingState.startedAt) {
            writingState.startedAt = now;
        }

        if (writingRuntimeState.lastInputAt) {
            var pauseDuration = now - writingRuntimeState.lastInputAt;

            if (pauseDuration > 1200) {
                writingRuntimeState.pauses.push({
                    time: now,
                    duration: pauseDuration
                });
            }
        }

        if (inputType.indexOf('delete') === 0 || lengthDelta < 0) {
            deleted = Math.max(1, Math.abs(lengthDelta));
        } else if (inputType.indexOf('insert') === 0 || lengthDelta > 0) {
            inserted = Math.max(1, lengthDelta);
        }

        writingRuntimeState.lastInputAt = now;
        writingRuntimeState.lastEditorLength = nextLength;
        writingState.content = nextContent;

        if (!nextContent && writingEditor) {
            writingEditor.textContent = '';
        }

        recordWritingActivity(now, inserted, deleted);
        queueWritingAutosave();
        refreshWritingMetrics({
            forceRoomNote: true
        });
        wakeGhostUI(2200);
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
            var track = getSelectedLayerTrack(layerName);

            audioState.layers[layerName] = createAudioController(layerName, track ? track.src : '', {
                loop: true,
                volume: 0
            });
        });

        audioState.completionChime = createAudioController('completion-chime', COMPLETION_CHIME_SOURCE, {
            loop: false,
            volume: 0.42
        });
    }

    function replaceLayerAudioController(layerName) {
        var existingController = audioState.layers[layerName];
        var nextTrack = getSelectedLayerTrack(layerName);

        if (!nextTrack) {
            return;
        }

        if (existingController && existingController.audio) {
            completeAudioFade(existingController, 0, {
                resetOnPause: true
            });
        }

        audioState.layers[layerName] = createAudioController(layerName, nextTrack.src, {
            loop: true,
            volume: 0
        });
    }

    function setLayerTrack(layerName, trackKey, options) {
        var config = options || {};
        var nextTrack = getLayerTrack(layerName, trackKey);
        var currentTrack = getSelectedLayerTrack(layerName);

        if (!nextTrack) {
            return;
        }

        if (currentTrack && currentTrack.key === nextTrack.key) {
            syncLayerTrackUI(layerName);
            return;
        }

        layerTrackState[layerName] = nextTrack.key;
        stopLayerPreview(true);
        syncLayerTrackUI(layerName);
        replaceLayerAudioController(layerName);
        syncLayerAudio(layerName, {
            duration: 320,
            allowPreview: sessionState.running,
            resetOnPause: false
        });

        if (config.save !== false) {
            saveSettings();
        }
    }

    function primeLayerPlaybackForInteraction() {
        if (audioState.hasPrimedPlayback) {
            return;
        }

        audioState.hasPrimedPlayback = true;

        layerNames.forEach(function (layerName) {
            var controller = audioState.layers[layerName];
            var layerState = getLayerState(layerName);
            var audio = controller && controller.audio ? controller.audio : null;
            var playPromise = null;

            if (!audio || !layerState.enabled || layerState.volume <= 0.001) {
                return;
            }

            audio.volume = 0;

            try {
                playPromise = audio.play();
            } catch (error) {
                console.warn('Focus Room audio warmup failed:', audio.currentSrc || audio.src || layerName, error);
                return;
            }

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function (error) {
                    console.warn('Focus Room audio warmup failed:', audio.currentSrc || audio.src || layerName, error);
                });
            }
        });
    }

    function registerAudioInteraction() {
        audioState.hasUserInteracted = true;
        primeLayerPlaybackForInteraction();
    }

    function stopLayerPreview(shouldRestore) {
        var restoreAudio = shouldRestore !== false;
        var shouldRestorePreview = audioState.previewRestoreAllowPreview;

        window.clearTimeout(audioState.previewTimer);
        audioState.previewTimer = null;

        if (!audioState.previewLayer) {
            return;
        }

        audioState.previewLayer = '';
        audioState.previewRestoreAllowPreview = false;
        syncLayerPreviewUI();

        if (!restoreAudio) {
            return;
        }

        syncAllLayerAudio({
            allowPreview: shouldRestorePreview,
            duration: prefersReducedMotion() ? 0 : 260,
            resetOnPause: !sessionState.running,
            keepAliveOnZero: !sessionState.running
        });
    }

    function previewLayerAudio(layerName) {
        var controller = audioState.layers[layerName];
        var audio = controller && controller.audio ? controller.audio : null;
        var selectedTrack = getSelectedLayerTrack(layerName);

        if (!audio || !selectedTrack) {
            return;
        }

        stopLayerPreview(false);
        registerAudioInteraction();

        audioState.previewRestoreAllowPreview = !sessionState.running && layerNames.some(function (name) {
            var currentController = audioState.layers[name];
            var currentAudio = currentController && currentController.audio ? currentController.audio : null;

            return !!(currentAudio && !currentAudio.paused && currentAudio.volume > 0.001);
        });
        audioState.previewLayer = layerName;
        syncLayerPreviewUI();

        layerNames.forEach(function (name) {
            var targetController = audioState.layers[name];

            if (name === layerName) {
                if (typeof selectedTrack.previewStart === 'number') {
                    try {
                        audio.currentTime = clamp(selectedTrack.previewStart, 0, Math.max(0, (audio.duration || selectedTrack.previewStart) - 0.25));
                    } catch (error) {
                        // Ignore preview seek failures and continue from the current frame.
                    }
                }

                fadeAudioController(targetController, getLayerPreviewVolume(layerName), prefersReducedMotion() ? 0 : 160, {
                    resetOnPause: false
                });
                return;
            }

            fadeAudioController(targetController, 0, prefersReducedMotion() ? 0 : 140, {
                resetOnPause: false,
                keepAliveOnZero: true
            });
        });

        audioState.previewTimer = window.setTimeout(function () {
            stopLayerPreview(true);
        }, prefersReducedMotion() ? 1200 : 2600);
        wakeGhostUI(2600);
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
            if (config.keepAliveOnZero) {
                return;
            }

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
        var targetVolume = shouldPlay ? getEffectiveLayerVolume(layerName, layerState.volume) : 0;
        var shouldKeepAliveOnZero = !shouldPlay && !!config.keepAliveOnZero && layerState.enabled && layerState.volume > 0.001;

        fadeAudioController(
            controller,
            targetVolume,
            typeof config.duration === 'number' ? config.duration : (shouldPlay ? 850 : 450),
            {
                resetOnPause: !!config.resetOnPause,
                keepAliveOnZero: shouldKeepAliveOnZero
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

    function warmAudibleLayers() {
        getAudibleLayerNames().forEach(function (layerName) {
            var controller = audioState.layers[layerName];
            var audio = controller && controller.audio ? controller.audio : null;

            if (!audio) {
                return;
            }

            if (audio.readyState === 0) {
                safePreloadAudio(audio);
            }

            if (!audio.paused) {
                return;
            }

            audio.volume = 0;
            safePlayAudio(audio);
        });
    }

    function scheduleSessionAudioRecovery() {
        window.clearTimeout(audioState.sessionRecoveryTimer);
        audioState.sessionRecoveryTimer = null;

        audioState.sessionRecoveryTimer = window.setTimeout(function () {
            var audibleLayers = getAudibleLayerNames();
            var hasLiveLayer = audibleLayers.some(function (layerName) {
                var controller = audioState.layers[layerName];
                var audio = controller && controller.audio ? controller.audio : null;

                return !!(audio && !audio.paused);
            });

            if (!audibleLayers.length) {
                return;
            }

            if (!hasLiveLayer) {
                warmAudibleLayers();
            }

            syncAllLayerAudio({
                duration: prefersReducedMotion() ? 0 : 320,
                resetOnPause: false
            });
        }, prefersReducedMotion() ? 0 : 220);
    }

    function stopCompletionChime() {
        window.clearTimeout(audioState.completionTimer);

        if (!audioState.completionChime || !audioState.completionChime.audio) {
            return;
        }

        cancelAudioFade(audioState.completionChime);

        try {
            audioState.completionChime.audio.pause();
            audioState.completionChime.audio.currentTime = 0;
        } catch (error) {
            // Ignore reset failures; the next play attempt will recover.
        }
    }

    function playCompletionChime() {
        if (!audioState.completionChime || !audioState.completionChime.audio || !audioState.hasUserInteracted) {
            return;
        }

        stopCompletionChime();
        audioState.completionChime.audio.volume = 0.42;
        safePlayAudio(audioState.completionChime.audio);
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

        syncModePresentation();
        syncSceneVideoPlayback();
        refreshPresence({
            force: true
        });
    }

    function setThresholdPromptCopy() {
        if (!appThresholdLabel || !appThresholdPrompt || !appThresholdState) {
            return;
        }

        if (thresholdState.active) {
            appThresholdLabel.textContent = 'Holding';
            appThresholdPrompt.textContent = appModeState.mode === 'writing'
                ? 'Stay steady. The page is rising into the room.'
                : 'Stay steady. Blur softens and the room begins to rise.';
            appThresholdState.textContent = appModeState.mode === 'writing' ? 'Writing room opening' : 'Threshold opening';
            return;
        }

        appThresholdLabel.textContent = 'Hold to Enter';
        appThresholdPrompt.textContent = thresholdState.hovered
            ? (appModeState.mode === 'writing'
                ? 'The page is awake. Hold for a breath and let the room support the draft.'
                : 'The room is awake. Hold for a breath to cross the threshold.')
            : (appModeState.mode === 'writing'
                ? 'Press and hold to let the writing room surface.'
                : 'Press and hold to let the room surface.');
        appThresholdState.textContent = thresholdState.hovered
            ? (appModeState.mode === 'writing' ? 'Writing room waking' : 'Room waking')
            : 'Ready when you are';
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

        if (appModeState.mode === 'writing') {
            if (sessionState.completionVisible) {
                appRoomNote.textContent = 'The page can rest here a moment. The room is still holding what moved.';
                return;
            }

            if (!writingState.content.trim()) {
                appRoomNote.textContent = writingState.task.trim()
                    ? 'The intention is set. Start with the first line that feels true enough.'
                    : 'Set a quiet intention, then let the room meet the first sentence with you.';
                return;
            }

            if (sessionState.running) {
                appRoomNote.textContent = 'Transport is live. The room is reading cadence, pauses, and pressure to keep the page gentle.';
                return;
            }

            if (writingState.inferredState === 'fluent') {
                appRoomNote.textContent = 'The draft has momentum. Keep the room light and let the next line arrive before editing back.';
                return;
            }

            if (writingState.inferredState === 'reflective') {
                appRoomNote.textContent = 'The room has softened for reflection. Stay near the slower sentence until it clarifies.';
                return;
            }

            if (writingState.inferredState === 'stuck') {
                appRoomNote.textContent = 'Pressure is easing down. One honest line is enough to get the page moving again.';
                return;
            }

            if (writingState.inferredState === 'deep') {
                appRoomNote.textContent = 'Deep focus has settled in. Let the cinematic edge stay earned and quiet.';
                return;
            }

            appRoomNote.textContent = 'The room is settling around the page. A few steady lines will do.';
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

        appRoomNote.textContent = readableNames.join(', ') + (activeLayers.length > 3 ? ', and more' : '') + ' are ready. Roll transport to bring them into the room.';
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

    function getPresenceSessionId() {
        if (presenceState.sessionId) {
            return presenceState.sessionId;
        }

        var storageKeyName = 'focus-room.presence-session';
        var nextId = '';

        try {
            nextId = window.sessionStorage.getItem(storageKeyName) || '';
        } catch (error) {
            nextId = '';
        }

        if (!nextId) {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                nextId = window.crypto.randomUUID();
            } else {
                nextId = 'fr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
            }

            try {
                window.sessionStorage.setItem(storageKeyName, nextId);
            } catch (error) {
                // Ignore storage failures and keep the in-memory id for this tab.
            }
        }

        presenceState.sessionId = nextId;
        return nextId;
    }

    function isPresenceActive() {
        return !!(appState.isOpen && appState.phase === 'room' && !document.hidden);
    }

    function getPresenceEndpoint() {
        if (!window.location || window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null') {
            return '';
        }

        return window.location.origin + '/api/focus-room-presence';
    }

    function computeAmbientPresenceBase(hours) {
        if (hours < 6) {
            return 12;
        }

        if (hours < 9) {
            return 18;
        }

        if (hours < 12) {
            return 32;
        }

        if (hours < 17) {
            return 36;
        }

        if (hours < 23) {
            return 42;
        }

        return 20;
    }

    function makeFallbackPresenceSnapshot(now) {
        var timestamp = typeof now === 'number' ? now : Date.now();
        var date = new Date(timestamp);
        var hours = date.getHours() + (date.getMinutes() / 60);
        var minuteOfDay = (date.getHours() * 60) + date.getMinutes();
        var activeLayerCount = getAudibleLayerNames().length;
        var sceneConfig = SCENE_VIDEOS[sessionState.sceneKey] || null;
        var sceneLabel = sceneConfig ? sanitizeSceneTitle(sceneConfig.label || sessionState.sceneKey) : '';
        var sceneBoost = /(coffee|cafe)/i.test(sceneLabel) ? 2 : 0;
        var drift = (Math.sin((minuteOfDay / 1440) * Math.PI * 4 + (date.getDay() + 1) * 0.72) * 1.8) +
            (Math.cos((minuteOfDay / 1440) * Math.PI * 2 - 0.8) * 0.9);
        var base = computeAmbientPresenceBase(hours);
        var runningBoost = isPresenceActive() && sessionState.running ? 3 : 0;
        var writingBoost = isPresenceActive() && appModeState.mode === 'writing' ? 2 : 0;
        var count = Math.max(12, Math.round(base + drift + runningBoost + writingBoost + Math.min(4, activeLayerCount) + sceneBoost));
        var enteredLast10m = Math.max(4, Math.round((count * 0.28) + (writingBoost * 0.8) + (runningBoost * 0.6) + Math.max(0, drift)));
        var activity = clamp(0.18 + (count * 0.028) + (sessionState.running ? 0.10 : 0) + (appModeState.mode === 'writing' ? 0.04 : 0), 0.22, 0.92);
        var pulseMs = Math.round(clamp(7800 - (count * 120) - (sessionState.running ? 500 : 0), 2900, 7800));
        var actionPool = [
            'Someone returned to their work',
            'A few desks settled back in',
            'Someone entered the room',
            'The room filled in quietly'
        ];
        var recentAction = actionPool[Math.abs(Math.round((minuteOfDay / 3) + count + writingBoost)) % actionPool.length];

        return {
            count: count,
            enteredLast10m: enteredLast10m,
            recentAction: recentAction,
            activity: activity,
            pulseMs: pulseMs,
            source: 'signal'
        };
    }

    function normalizePresenceSnapshot(payload) {
        var rawActivity = Number(payload && payload.activity);
        var rawPulseMs = Number(payload && payload.pulseMs);
        var rawEntered = Number(payload && payload.enteredLast10m);

        return {
            count: Math.max(0, Math.round(Number(payload && payload.count) || 0)),
            enteredLast10m: Math.max(0, Math.round(isNaN(rawEntered) ? 0 : rawEntered)),
            recentAction: String(payload && payload.recentAction || '').trim(),
            activity: clamp(isNaN(rawActivity) ? 0.24 : rawActivity, 0.18, 0.96),
            pulseMs: Math.round(clamp(isNaN(rawPulseMs) ? 5600 : rawPulseMs, 2800, 8200)),
            source: payload && payload.source === 'live' ? 'live' : 'signal'
        };
    }

    function getPresenceHoldDuration() {
        return Math.round(randomBetween(5.2 * 60 * 1000, 14 * 60 * 1000));
    }

    function getPresenceStepDuration() {
        return Math.round(randomBetween(18 * 1000, 42 * 1000));
    }

    function getScenePresenceRange(sceneKey) {
        var sceneConfig = SCENE_VIDEOS[sceneKey] || null;
        var title = sceneConfig ? sanitizeSceneTitle(sceneConfig.label || sceneConfig.file || sceneKey) : sanitizeSceneTitle(sceneKey);
        var normalized = sceneKeyFromTitle(title);
        var keywords = normalized.split('-');

        function hasKeyword(keyword) {
            return keywords.indexOf(keyword) !== -1;
        }

        if (sceneKey === 'coffee' || sceneKey === 'calmCafe' || hasKeyword('cafe') || hasKeyword('coffee')) {
            return { min: 44, max: 88, base: 58 };
        }

        if (sceneKey === 'library' || hasKeyword('library') || hasKeyword('archive') || hasKeyword('study')) {
            return { min: 24, max: 62, base: 36 };
        }

        if (sceneKey === 'sanctuary' || sceneKey === 'cloister' || hasKeyword('sanctuary') || hasKeyword('quiet') || hasKeyword('silence') || hasKeyword('still') || hasKeyword('stone') || hasKeyword('empty')) {
            return { min: 6, max: 22, base: 12 };
        }

        if (sceneKey === 'midnight' || hasKeyword('midnight') || hasKeyword('late') || hasKeyword('lanterns') || hasKeyword('warmth') || hasKeyword('night')) {
            return { min: 14, max: 42, base: 28 };
        }

        if (hasKeyword('train') || hasKeyword('world') || hasKeyword('motion') || hasKeyword('horizon')) {
            return { min: 18, max: 48, base: 30 };
        }

        return { min: 12, max: 54, base: 26 };
    }

    function getScenePresenceBaseCount(sceneKey) {
        var range = getScenePresenceRange(sceneKey);

        return clamp(range.base, range.min, range.max);
    }

    function getRandomPresenceCountInRange(range) {
        var safeRange = range || { min: 1, max: 200, base: 36 };

        return clamp(randomInt(safeRange.min, safeRange.max), safeRange.min, safeRange.max);
    }

    function updatePresenceCountTrajectory(now) {
        var timestamp = typeof now === 'number' ? now : Date.now();
        var activeSceneKey = sessionState.sceneKey || 'midnight';
        var sceneRange = getScenePresenceRange(activeSceneKey);
        var reseededCount = 0;

        if (presenceState.sceneKey !== activeSceneKey) {
            reseededCount = getRandomPresenceCountInRange(sceneRange);
            presenceState.sceneKey = activeSceneKey;
            presenceState.count = reseededCount;
            presenceState.targetCount = reseededCount;
            presenceState.nextCountStepAt = 0;
            presenceState.nextCountShiftAt = timestamp + getPresenceHoldDuration();
            return presenceState.count;
        }

        if (!presenceState.nextCountShiftAt) {
            presenceState.sceneKey = activeSceneKey;
            presenceState.count = clamp(Math.round(Number(presenceState.count) || getScenePresenceBaseCount(activeSceneKey)), sceneRange.min, sceneRange.max);
            presenceState.targetCount = presenceState.count;
            presenceState.nextCountStepAt = 0;
            presenceState.nextCountShiftAt = timestamp + getPresenceHoldDuration();
            return presenceState.count;
        }

        if (presenceState.count !== presenceState.targetCount) {
            if (timestamp >= presenceState.nextCountStepAt) {
                presenceState.count += presenceState.targetCount > presenceState.count ? 1 : -1;

                if (presenceState.count === presenceState.targetCount) {
                    presenceState.nextCountStepAt = 0;
                    presenceState.nextCountShiftAt = timestamp + getPresenceHoldDuration();
                } else {
                    presenceState.nextCountStepAt = timestamp + getPresenceStepDuration();
                }
            }

            return presenceState.count;
        }

        if (timestamp < presenceState.nextCountShiftAt) {
            return presenceState.count;
        }

        var delta = randomInt(1, 9);
        var direction = Math.random() < 0.5 ? -1 : 1;

        if (presenceState.count <= sceneRange.min) {
            direction = 1;
        } else if (presenceState.count >= sceneRange.max) {
            direction = -1;
        }

        var nextTarget = clamp(presenceState.count + (direction * delta), sceneRange.min, sceneRange.max);

        if (nextTarget === presenceState.count) {
            nextTarget = clamp(presenceState.count + ((direction * -1) * delta), sceneRange.min, sceneRange.max);
        }

        presenceState.targetCount = nextTarget;
        presenceState.nextCountStepAt = timestamp + getPresenceStepDuration();
        return presenceState.count;
    }

    function getPresenceDisplayLine(count) {
        var safeCount = Math.max(1, Math.round(Number(count) || 36));

        return safeCount + ' anonymous in room';
    }

    function renderPresenceGrid(count) {
        if (!appPresenceGrid) {
            return;
        }

        var safeCount = Math.max(1, Math.min(200, Math.round(Number(count) || 36)));
        var rows = 3;
        var columns = Math.max(1, Math.ceil(safeCount / rows));
        var availableWidth = Math.max(180, appPresenceGrid.clientWidth || 212);
        var gap = columns >= 56 ? 1 : (columns >= 28 ? 2 : 3);
        var dotSize = Math.floor((availableWidth - ((columns - 1) * gap)) / columns);
        var safeDotSize = clamp(dotSize, 2, 6);
        var dots = '';
        var index = 0;

        for (index = 0; index < safeCount; index += 1) {
            dots += '<span class="fr-hud-presence-dot"></span>';
        }

        appPresenceGrid.style.setProperty('--fr-presence-grid-columns', String(columns));
        appPresenceGrid.style.setProperty('--fr-presence-dot-size', safeDotSize + 'px');
        appPresenceGrid.style.setProperty('--fr-presence-dot-gap', gap + 'px');
        appPresenceGrid.innerHTML = dots;
    }

    function renderPresence(snapshot) {
        var timestamp = Date.now();
        var nextSnapshot = snapshot || makeFallbackPresenceSnapshot(timestamp);

        presenceState.reportedCount = nextSnapshot.count;
        presenceState.enteredLast10m = nextSnapshot.enteredLast10m;
        presenceState.recentAction = nextSnapshot.recentAction;
        presenceState.activity = nextSnapshot.activity;
        presenceState.pulseMs = nextSnapshot.pulseMs;
        presenceState.source = nextSnapshot.source;
        presenceState.count = updatePresenceCountTrajectory(timestamp);

        if (appPresenceCount) {
            appPresenceCount.textContent = getPresenceDisplayLine(presenceState.count);
        }

        renderPresenceGrid(presenceState.count);

        if (appRoomShell) {
            appRoomShell.style.setProperty('--fr-presence-activity', nextSnapshot.activity.toFixed(3));
            appRoomShell.style.setProperty('--fr-presence-meter', nextSnapshot.activity.toFixed(3));
            appRoomShell.style.setProperty('--fr-presence-pulse-ms', nextSnapshot.pulseMs + 'ms');
            appRoomShell.style.setProperty('--fr-presence-glow', clamp(0.02 + (nextSnapshot.activity * 0.16), 0.02, 0.18).toFixed(3));
        }
    }

    function refreshPresence(options) {
        var config = options || {};
        var fallbackSnapshot = makeFallbackPresenceSnapshot(Date.now());
        var endpoint = config.preferNetwork === false ? '' : getPresenceEndpoint();

        if (!endpoint || typeof window.fetch !== 'function') {
            renderPresence(fallbackSnapshot);
            return Promise.resolve(fallbackSnapshot);
        }

        if (presenceState.pending && !config.force) {
            return presenceState.pending;
        }

        var request = null;
        request = window.fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: getPresenceSessionId(),
                present: isPresenceActive(),
                phase: appState.phase,
                running: !!(sessionState.running && isPresenceActive()),
                mode: appModeState.mode
            }),
            cache: 'no-store',
            credentials: 'same-origin',
            keepalive: !!config.keepalive
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('Presence request failed with status ' + response.status);
            }

            return response.json();
        }).then(function (payload) {
            var liveSnapshot = normalizePresenceSnapshot(payload);
            var snapshot = liveSnapshot.count > 0
                ? liveSnapshot
                : {
                    count: fallbackSnapshot.count,
                    enteredLast10m: fallbackSnapshot.enteredLast10m,
                    recentAction: fallbackSnapshot.recentAction,
                    activity: clamp(Math.max(fallbackSnapshot.activity, liveSnapshot.activity * 0.74), 0.22, 0.92),
                    pulseMs: Math.round(clamp(Math.min(fallbackSnapshot.pulseMs, liveSnapshot.pulseMs + 400), 2800, 8200)),
                    source: 'signal'
                };

            renderPresence(snapshot);
            return snapshot;
        }).catch(function () {
            renderPresence(fallbackSnapshot);
            return fallbackSnapshot;
        }).finally(function () {
            if (presenceState.pending === request) {
                presenceState.pending = null;
            }
        });

        presenceState.pending = request;
        return request;
    }

    function beginPresenceHeartbeat() {
        if (presenceState.heartbeatTimer) {
            return;
        }

        if (!presenceState.pending) {
            refreshPresence({
                force: true
            });
        }

        presenceState.heartbeatTimer = window.setInterval(function () {
            refreshPresence();
        }, 22000);
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

    function defaultSceneSwitcherExpanded() {
        return appModeState.mode !== 'writing';
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
        layerNames.forEach(function (layerName) {
            syncLayerTrackUI(layerName);
            syncLayerVisual(layerName);
        });
        updateMixSummary();
        updateRoomNote();
        renderPresence(makeFallbackPresenceSnapshot(Date.now()));
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
        var presence = getLayerState('presence');
        var water = getLayerState('water');
        var storm = getLayerState('storm');
        var utility = getLayerState('utility');
        var chime = getLayerState('chime');

        var rainValue = rain.enabled ? rain.volume : 0;
        var pianoValue = piano.enabled ? piano.volume : 0;
        var windValue = wind.enabled ? wind.volume : 0;
        var presenceValue = presence.enabled ? presence.volume : 0;
        var waterValue = water.enabled ? water.volume : 0;
        var stormValue = storm.enabled ? storm.volume : 0;
        var utilityValue = utility.enabled ? utility.volume : 0;
        var chimeValue = chime.enabled ? chime.volume : 0;

        var warmth = clamp(atmosphereState.warmth + pianoValue * 0.24 + presenceValue * 0.04 + stormValue * 0.04 + visualState.lampWarmthBoost, 0, 1);
        var focusDepth = clamp(atmosphereState.focusDepth + windValue * 0.16 + utilityValue * 0.12 + chimeValue * 0.05 + presenceValue * 0.08 + visualState.progress * 0.16, 0, 1);
        var fog = clamp(atmosphereState.fog + rainValue * 0.14 + windValue * 0.08 + stormValue * 0.18 + waterValue * 0.04, 0, 1);
        var rainStrength = clamp(Math.max(0.06, rainValue + stormValue * 0.46) + visualState.rainDensityBoost, 0.06, 1);
        var roomCalm = clamp(0.42 + (1 - windValue) * 0.10 + waterValue * 0.08 + chimeValue * 0.03 - utilityValue * 0.08 - presenceValue * 0.04, 0.18, 0.84);
        var videoBrightness = clamp(0.03 + focusDepth * 0.08 + visualState.progress * 0.04 + chimeValue * 0.02 - rainStrength * 0.03 - stormValue * 0.02, 0.02, 0.16);
        var videoContrast = clamp(0.06 + focusDepth * 0.14 + stormValue * 0.06 + utilityValue * 0.05 + visualState.progress * 0.04, 0.04, 0.24);
        var videoSaturation = clamp(0.04 + warmth * 0.16 + chimeValue * 0.04 - fog * 0.04, 0.03, 0.22);
        var videoZoom = clamp(visualState.progress * 0.008 + focusDepth * 0.01 + utilityValue * 0.003 + stormValue * 0.002, 0, 0.022);
        var fogOverlay = clamp(0.04 + fog * 0.24 + rainStrength * 0.06 + stormValue * 0.08, 0.04, 0.42);
        var warmthOverlay = clamp(0.04 + warmth * 0.22 + visualState.progress * 0.08 + stormValue * 0.03 + presenceValue * 0.03, 0.04, 0.38);
        var glassOverlay = clamp(0.05 + rainStrength * 0.18 + waterValue * 0.06 + stormValue * 0.08 + chimeValue * 0.05 + presenceValue * 0.04, 0.05, 0.32);
        var writingDescriptor = appModeState.mode === 'writing' ? backgroundState.descriptor : null;
        var writingVisuals = writingDescriptor && writingDescriptor.visual ? writingDescriptor.visual : null;
        var writingClarity = 0.44;
        var writingSoftness = 0.4;
        var writingSupport = 0.18;

        if (writingVisuals) {
            writingClarity = clamp(writingVisuals.clarity, 0.24, 0.94);
            writingSoftness = clamp(writingVisuals.softness, 0.12, 0.66);
            writingSupport = clamp(writingVisuals.support, 0.08, 0.56);
            focusDepth = clamp(focusDepth + writingVisuals.focusDepth, 0, 1);
            roomCalm = clamp(roomCalm + writingVisuals.roomCalm, 0.18, 0.88);
            videoBrightness = clamp(videoBrightness + writingVisuals.videoBrightness, 0.02, 0.22);
            videoContrast = clamp(videoContrast + writingVisuals.videoContrast, 0.04, 0.28);
            videoSaturation = clamp(videoSaturation + writingVisuals.videoSaturation, 0.03, 0.26);
            videoZoom = clamp(videoZoom + writingVisuals.videoZoom, 0, 0.028);
            fogOverlay = clamp(fogOverlay + writingVisuals.fogOverlay, 0.03, 0.44);
            warmthOverlay = clamp(warmthOverlay + writingVisuals.warmthOverlay, 0.04, 0.42);
            glassOverlay = clamp(glassOverlay + writingVisuals.glassOverlay, 0.04, 0.34);
        }

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
        appRoomShell.style.setProperty('--fr-presence-layer', presenceValue.toFixed(3));
        appRoomShell.style.setProperty('--fr-writing-clarity', writingClarity.toFixed(3));
        appRoomShell.style.setProperty('--fr-writing-softness', writingSoftness.toFixed(3));
        appRoomShell.style.setProperty('--fr-writing-support', writingSupport.toFixed(3));
    }

    function updateDurationButtons(activeMinutes) {
        appDurationButtons.forEach(function (button) {
            button.classList.toggle('is-active', Number(button.getAttribute('data-app-duration') || '10') === activeMinutes);
        });
    }

    function resetSession() {
        stopLayerPreview(false);
        sessionState.running = false;
        sessionState.startedAt = null;
        sessionState.pausedElapsedMs = 0;
        sessionState.completionVisible = false;
        window.clearTimeout(audioState.sessionRecoveryTimer);
        audioState.sessionRecoveryTimer = null;
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
        refreshPresence({
            force: true
        });
        setGhostPanels(false);
    }

    function finishSession() {
        sessionState.running = false;
        sessionState.startedAt = null;
        sessionState.pausedElapsedMs = sessionState.demoDurationMs;
        sessionState.completionVisible = true;
        sessionState.frame = null;
        window.clearTimeout(audioState.sessionRecoveryTimer);
        audioState.sessionRecoveryTimer = null;
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
        refreshPresence({
            force: true
        });
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
        stopLayerPreview(false);
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
            refreshPresence({
                force: true
            });
            wakeGhostUI();
            return;
        }

        if (sessionState.completionVisible || sessionState.pausedElapsedMs >= sessionState.demoDurationMs) {
            sessionState.pausedElapsedMs = 0;
        }

        stopCompletionChime();
        reviveEnabledMutedLayers();

        if (appCompletionNote) {
            appCompletionNote.classList.remove('is-visible');
        }

        sessionState.completionVisible = false;
        sessionState.running = true;
        sessionState.startedAt = null;
        warmAudibleLayers();

        if (appStartButton) {
            appStartButton.textContent = 'Pause Session';
        }

        updateRoomNote();
        refreshPresence({
            force: true
        });
        wakeGhostUI();
        syncAllLayerAudio({
            duration: 900,
            resetOnPause: false
        });
        scheduleSessionAudioRecovery();
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
            },
            writing: {
                mode: appModeState.mode,
                task: writingState.task,
                content: writingState.content
            }
        };

        layerNames.forEach(function (name) {
            var toggle = document.querySelector('[data-app-layer-toggle="' + name + '"]');
            var slider = document.querySelector('[data-app-layer-volume="' + name + '"]');
            var selectedTrack = getSelectedLayerTrack(name);

            payload.layers[name] = {
                enabled: !!(toggle && toggle.checked),
                volume: slider ? Number(slider.value || '0') : 0,
                trackKey: selectedTrack ? selectedTrack.key : null
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
                if (Number(button.getAttribute('data-app-duration') || '10') === parsed.selectedMinutes) {
                    matchingButton = button;
                    return true;
                }

                return false;
            });

            if (matchingButton) {
                sessionState.selectedMinutes = Number(matchingButton.getAttribute('data-app-duration') || '10');
                sessionState.demoDurationMs = Number(matchingButton.getAttribute('data-app-demo-seconds') || '600') * 1000;
            }
        }

        if (typeof parsed.sceneKey === 'string' && Object.prototype.hasOwnProperty.call(SCENE_VIDEOS, parsed.sceneKey)) {
            sessionState.sceneKey = parsed.sceneKey;
        }

        if (parsed.layers) {
            layerNames.forEach(function (name) {
                var config = getLayerConfig(name);
                var storedLayer = parsed.layers[name];
                var toggle = document.querySelector('[data-app-layer-toggle="' + name + '"]');
                var slider = document.querySelector('[data-app-layer-volume="' + name + '"]');
                var fallbackTrack = config ? config.defaultTrack : null;
                var resolvedTrack = getLayerTrack(name, storedLayer && storedLayer.trackKey ? storedLayer.trackKey : fallbackTrack);

                layerTrackState[name] = resolvedTrack ? resolvedTrack.key : fallbackTrack;

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
        else {
            layerNames.forEach(function (name) {
                var config = getLayerConfig(name);
                var defaultTrack = getLayerTrack(name, config ? config.defaultTrack : null);
                layerTrackState[name] = defaultTrack ? defaultTrack.key : null;
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

        if (parsed.writing) {
            if (parsed.writing.mode === 'writing' || parsed.writing.mode === 'focus') {
                appModeState.mode = parsed.writing.mode;
            }

            if (typeof parsed.writing.task === 'string') {
                writingState.task = normalizeWritingText(parsed.writing.task);
            }

            if (typeof parsed.writing.content === 'string') {
                writingState.content = normalizeWritingText(parsed.writing.content);
            }
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
            appThresholdPrompt.textContent = appModeState.mode === 'writing'
                ? 'The room opens and the page comes quietly forward.'
                : 'The room opens and the controls fall back into the edges.';
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
            syncAllLayerAudio({
                allowPreview: false,
                duration: prefersReducedMotion() ? 0 : 900,
                resetOnPause: false
            });
            wakeGhostUI(2600);

            if (appModeState.mode === 'writing') {
                focusWritingSurface();
            } else if (appStartButton) {
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

        registerAudioInteraction();
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
        closeLayerDrawer();
        syncLayerExpandUI();
        setMixerExpanded(defaultMixerExpanded());
        setSceneSwitcherExpanded(defaultSceneSwitcherExpanded());
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

        stopLayerPreview(false);
        appState.isOpen = false;
        commitWritingFocusDuration();
        syncSceneVideoPlayback();
        refreshPresence({
            force: true,
            keepalive: true
        });
        cancelThresholdHold();
        stopAppThresholdLoop();
        window.clearTimeout(sessionState.ghostTimer);
        window.clearTimeout(audioState.sessionRecoveryTimer);
        audioState.sessionRecoveryTimer = null;
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
        closeLayerDrawer();
        syncLayerExpandUI();
        setSceneSwitcherExpanded(false);

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
            if (sceneSwitcherState.expanded) {
                event.preventDefault();
                setSceneSwitcherExpanded(false);
                return;
            }

            if (layerDrawerState.openLayer) {
                event.preventDefault();
                closeLayerDrawer();
                syncLayerExpandUI();
                return;
            }

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

        var resolvedPath = resolveFocusRoomPath(filePath);
        var marker = 'swiftui-prototype/';
        var markerIndex = filePath.indexOf(marker);
        var pathLabel = markerIndex >= 0 ? filePath.slice(markerIndex) : filePath;
        var fallback = fallbackContentFor(button, filePath);

        updateActiveCodeButtons(filePath);
        renderCode(pathLabel, 'Loading source...', 'Loading');

        if (window.location.protocol === 'file:' && fallback) {
            renderCode(pathLabel, fallback, 'Excerpt loaded for local preview');
            return;
        }

        fetch(resolvedPath)
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
            registerAudioInteraction();
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
            appRoomShell.addEventListener(eventName, function (event) {
                wakeGhostUI();
            }, { passive: true });
        });
    }

    if (sceneSwitcherToggle) {
        sceneSwitcherToggle.addEventListener('click', function () {
            toggleSceneSwitcher();
            wakeGhostUI(2200);
        });
    }

    appModeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var requestedMode = button.getAttribute('data-app-mode-control');
            setAppMode(requestedMode, {
                focusSurface: requestedMode === 'writing' && appState.phase === 'room',
                forceWhisper: requestedMode === 'writing'
            });
            wakeGhostUI(2200);
        });
    });

    if (writingTaskInput) {
        writingTaskInput.addEventListener('input', handleWritingTaskInput);
        writingTaskInput.addEventListener('focus', function () {
            wakeGhostUI(2200);
        });
        writingTaskInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && writingEditor) {
                event.preventDefault();
                writingEditor.focus();
                placeCaretAtEnd(writingEditor);
            }
        });
    }

    if (writingEditor) {
        writingEditor.addEventListener('focus', handleWritingEditorFocus);
        writingEditor.addEventListener('blur', handleWritingEditorBlur);
        writingEditor.addEventListener('keydown', handleWritingEditorKeydown);
        writingEditor.addEventListener('paste', handleWritingEditorPaste);
        writingEditor.addEventListener('input', handleWritingEditorInput);
    }

    appDurationButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            sessionState.selectedMinutes = Number(button.getAttribute('data-app-duration') || '10');
            sessionState.demoDurationMs = Number(button.getAttribute('data-app-demo-seconds') || '600') * 1000;
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

    if (layerList) {
        layerList.addEventListener('pointerdown', function (event) {
            var interactiveTarget = findLayerEventTarget(event, 'data-app-layer-volume') ||
                findLayerEventTarget(event, 'data-app-layer-toggle') ||
                findLayerEventTarget(event, 'data-app-layer-preview') ||
                findLayerEventTarget(event, 'data-app-layer-expand');

            if (interactiveTarget && layerList.contains(interactiveTarget)) {
                registerAudioInteraction();
            }
        });

        layerList.addEventListener('click', function (event) {
            var previewButton = findLayerEventTarget(event, 'data-app-layer-preview');
            var expandButton = findLayerEventTarget(event, 'data-app-layer-expand');

            if (previewButton && layerList.contains(previewButton)) {
                previewLayerAudio(previewButton.getAttribute('data-app-layer-preview'));
                return;
            }

            if (expandButton && layerList.contains(expandButton)) {
                toggleLayerExpanded(expandButton.getAttribute('data-app-layer-expand'));
                wakeGhostUI(2200);
                return;
            }
        });

        layerList.addEventListener('change', function (event) {
            var toggle = findLayerEventTarget(event, 'data-app-layer-toggle');
            var slider = findLayerEventTarget(event, 'data-app-layer-volume');

            if (!toggle || !layerList.contains(toggle)) {
                if (!slider || !layerList.contains(slider)) {
                    return;
                }

                handleLayerVolumeChange(slider.getAttribute('data-app-layer-volume'));
                return;
            }

            handleLayerToggleChange(toggle.getAttribute('data-app-layer-toggle'));
        });

        layerList.addEventListener('input', function (event) {
            var slider = findLayerEventTarget(event, 'data-app-layer-volume');

            if (!slider || !layerList.contains(slider)) {
                return;
            }

            handleLayerVolumeChange(slider.getAttribute('data-app-layer-volume'));
        });
    }

    if (layerDrawer) {
        layerDrawer.addEventListener('pointerdown', function (event) {
            var interactiveTarget = findLayerEventTarget(event, 'data-app-layer-track') ||
                findLayerEventTarget(event, 'data-app-layer-drawer-close');

            if (interactiveTarget && layerDrawer.contains(interactiveTarget)) {
                registerAudioInteraction();
            }
        });

        layerDrawer.addEventListener('click', function (event) {
            var closeButton = findLayerEventTarget(event, 'data-app-layer-drawer-close');
            var trackButton = findLayerEventTarget(event, 'data-app-layer-track');

            if (closeButton && layerDrawer.contains(closeButton)) {
                closeLayerDrawer();
                syncLayerExpandUI();
                wakeGhostUI(1800);
                return;
            }

            if (trackButton && layerDrawer.contains(trackButton)) {
                var layerName = trackButton.getAttribute('data-app-layer-track');
                var trackKey = trackButton.getAttribute('data-track-key');

                registerAudioInteraction();
                setLayerTrack(layerName, trackKey);
                syncLayerVisual(layerName);
                updateMixSummary();
                updateRoomNote();
                wakeGhostUI(2200);
            }
        });
    }

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

    if (sceneGrid) {
        sceneGrid.addEventListener('click', function (event) {
            var button = event.target.closest('[data-scene-key]');

            if (!button || !sceneGrid.contains(button)) {
                return;
            }

            backgroundState.userSceneOverrideUntil = performance.now() + 90000;
            backgroundState.lastSceneChangeAt = performance.now();
            setSceneVideo(button.getAttribute('data-scene-key'), true);
            wakeGhostUI();
        });
    }

    codeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            loadCodeFile(button);
        });
    });

    renderLayerStripList();
    applyStoredSettings();
    initializeAudioEngine();
    syncWritingInputsFromState();
    renderSceneButtons();
    setSceneSwitcherExpanded(defaultSceneSwitcherExpanded());
    setSceneVideo(sessionState.sceneKey, false);
    syncAtmosphereInputs();
    syncAllLayers();
    resetSession();
    setMixerExpanded(defaultMixerExpanded());
    resetThresholdView();
    setAppMode(appModeState.mode, {
        save: false,
        allowSceneSwitch: false,
        forceWhisper: true
    });
    beginPresenceHeartbeat();
    beginPreviewLoop();

    writingRuntimeState.pulseTimer = window.setInterval(function () {
        if (appModeState.mode !== 'writing') {
            return;
        }

        refreshWritingMetrics({
            allowSceneSwitch: appState.phase === 'room'
        });
    }, 4000);

    window.addEventListener('resize', function () {
        if (!appRoomShell) {
            return;
        }

        setMixerExpanded(sessionState.mixerExpanded);
    });

    document.addEventListener('visibilitychange', function () {
        refreshPresence({
            force: true,
            keepalive: document.hidden
        });
    });

    window.addEventListener('pagehide', function () {
        refreshPresence({
            force: true,
            keepalive: true
        });
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
