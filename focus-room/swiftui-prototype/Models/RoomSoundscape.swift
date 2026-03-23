import Foundation

enum FocusRoomKind: String, CaseIterable, Codable, Identifiable {
    case study
    case library
    case forest

    var id: String { rawValue }

    var title: String {
        switch self {
        case .study:
            return "Focus Room"
        case .library:
            return "Library Room"
        case .forest:
            return "Forest Room"
        }
    }
}

protocol RoomSoundscapeStrategy {
    var roomKind: FocusRoomKind { get }
    var supportedLayers: [AmbientLayerKind] { get }

    func defaultLayers() -> [AmbientLayerSetting]
    func previewLevel(for holdProgress: Double) -> Double
    func makeMix(from layers: [AmbientLayerSetting], sessionProgress: Double) -> [AmbientLayerMix]
    func makeAtmosphere(
        from layers: [AmbientLayerSetting],
        sessionProgress: Double,
        sessionState: FocusSessionState,
        earnedStars: Int
    ) -> RoomAtmosphere
    func resolvedLayers(from storedLayers: [AmbientLayerSetting]) -> [AmbientLayerSetting]
}

extension RoomSoundscapeStrategy {
    func previewLevel(for holdProgress: Double) -> Double {
        let clampedProgress = clamped(holdProgress)
        return 0.24 + (clampedProgress * 0.54)
    }

    func resolvedLayers(from storedLayers: [AmbientLayerSetting]) -> [AmbientLayerSetting] {
        let defaultLookup = Dictionary(
            uniqueKeysWithValues: defaultLayers().map { ($0.kind, $0) }
        )

        return supportedLayers.map { kind in
            storedLayers.first(where: { $0.kind == kind })
                ?? defaultLookup[kind]
                ?? kind.defaultSetting()
        }
    }

    func mixedLayers(
        from layers: [AmbientLayerSetting],
        gains: [AmbientLayerKind: (from: Double, to: Double)],
        sessionProgress: Double
    ) -> [AmbientLayerMix] {
        let clampedProgress = clamped(sessionProgress)

        return resolvedLayers(from: layers).map { layer in
            guard layer.isEnabled else {
                return AmbientLayerMix(kind: layer.kind, level: 0)
            }

            let gain = gains[layer.kind] ?? (1, 1)
            let roomGain = gain.from + ((gain.to - gain.from) * clampedProgress)
            let level = clamped(layer.volume * roomGain)
            return AmbientLayerMix(kind: layer.kind, level: level)
        }
    }

    func level(
        for kind: AmbientLayerKind,
        in mix: [AmbientLayerMix]
    ) -> Double {
        mix.first(where: { $0.kind == kind })?.level ?? 0
    }

    func clamped(_ value: Double) -> Double {
        min(max(value, 0), 1)
    }
}

enum RoomSoundscapeFactory {
    static func makeStrategy(for roomKind: FocusRoomKind) -> any RoomSoundscapeStrategy {
        switch roomKind {
        case .study:
            return StudyRoomSoundscapeStrategy()
        case .library:
            return LibraryRoomSoundscapeStrategy()
        case .forest:
            return ForestRoomSoundscapeStrategy()
        }
    }
}

struct StudyRoomSoundscapeStrategy: RoomSoundscapeStrategy {
    let roomKind: FocusRoomKind = .study
    let supportedLayers = AmbientLayerKind.allCases

    func defaultLayers() -> [AmbientLayerSetting] {
        [
            AmbientLayerKind.piano.defaultSetting(isEnabled: true, volume: 0.42),
            AmbientLayerKind.rain.defaultSetting(isEnabled: true, volume: 0.58),
            AmbientLayerKind.brownNoise.defaultSetting(isEnabled: true, volume: 0.34),
            AmbientLayerKind.cafe.defaultSetting(isEnabled: false, volume: 0.18),
            AmbientLayerKind.whiteNoise.defaultSetting(isEnabled: false, volume: 0.12)
        ]
    }

    func previewLevel(for holdProgress: Double) -> Double {
        let clampedProgress = clamped(holdProgress)
        return 0.18 + (clampedProgress * 0.66)
    }

    func makeMix(from layers: [AmbientLayerSetting], sessionProgress: Double) -> [AmbientLayerMix] {
        mixedLayers(
            from: layers,
            gains: [
                .piano: (1.00, 0.88),
                .rain: (0.92, 1.08),
                .brownNoise: (0.94, 1.10),
                .cafe: (1.00, 0.82),
                .whiteNoise: (1.00, 0.80)
            ],
            sessionProgress: sessionProgress
        )
    }

    func makeAtmosphere(
        from layers: [AmbientLayerSetting],
        sessionProgress: Double,
        sessionState: FocusSessionState,
        earnedStars: Int
    ) -> RoomAtmosphere {
        let clampedProgress = clamped(sessionProgress)
        let mix = makeMix(from: layers, sessionProgress: clampedProgress)
        let completionBoost = sessionState == .completed ? 0.06 : 0
        let rainLevel = level(for: .rain, in: mix)
        let pianoLevel = level(for: .piano, in: mix)

        return RoomAtmosphere(
            progress: clampedProgress,
            lampWarmth: 0.24 + (clampedProgress * 0.46) + completionBoost,
            backgroundDepth: 0.22 + (clampedProgress * 0.5),
            rainIntensity: max(0.10, rainLevel + (clampedProgress * 0.08)),
            pianoIsSpinning: pianoLevel > 0.05,
            earnedStars: max(earnedStars, sessionState == .completed ? 1 : 0),
            backgroundBlur: 18 - (clampedProgress * 9),
            colorTemperature: 0.16 + (clampedProgress * 0.76) + completionBoost,
            grainIntensity: max(0.025, 0.16 - (clampedProgress * 0.12))
        )
    }
}

struct LibraryRoomSoundscapeStrategy: RoomSoundscapeStrategy {
    let roomKind: FocusRoomKind = .library
    let supportedLayers = AmbientLayerKind.allCases

    func defaultLayers() -> [AmbientLayerSetting] {
        [
            AmbientLayerKind.piano.defaultSetting(isEnabled: false, volume: 0.24),
            AmbientLayerKind.rain.defaultSetting(isEnabled: false, volume: 0.20),
            AmbientLayerKind.brownNoise.defaultSetting(isEnabled: true, volume: 0.36),
            AmbientLayerKind.cafe.defaultSetting(isEnabled: true, volume: 0.26),
            AmbientLayerKind.whiteNoise.defaultSetting(isEnabled: true, volume: 0.16)
        ]
    }

    func makeMix(from layers: [AmbientLayerSetting], sessionProgress: Double) -> [AmbientLayerMix] {
        mixedLayers(
            from: layers,
            gains: [
                .piano: (0.92, 0.72),
                .rain: (0.84, 0.62),
                .brownNoise: (0.96, 1.04),
                .cafe: (1.00, 0.86),
                .whiteNoise: (0.94, 1.02)
            ],
            sessionProgress: sessionProgress
        )
    }

    func makeAtmosphere(
        from layers: [AmbientLayerSetting],
        sessionProgress: Double,
        sessionState: FocusSessionState,
        earnedStars: Int
    ) -> RoomAtmosphere {
        let clampedProgress = clamped(sessionProgress)
        let mix = makeMix(from: layers, sessionProgress: clampedProgress)

        return RoomAtmosphere(
            progress: clampedProgress,
            lampWarmth: 0.20 + (clampedProgress * 0.38),
            backgroundDepth: 0.26 + (clampedProgress * 0.46),
            rainIntensity: max(0.04, level(for: .rain, in: mix) * 0.85),
            pianoIsSpinning: level(for: .piano, in: mix) > 0.06,
            earnedStars: max(earnedStars, sessionState == .completed ? 1 : 0),
            backgroundBlur: 16 - (clampedProgress * 7),
            colorTemperature: 0.10 + (clampedProgress * 0.56),
            grainIntensity: max(0.03, 0.14 - (clampedProgress * 0.08))
        )
    }
}

struct ForestRoomSoundscapeStrategy: RoomSoundscapeStrategy {
    let roomKind: FocusRoomKind = .forest
    let supportedLayers: [AmbientLayerKind] = [.piano, .rain, .brownNoise, .whiteNoise]

    func defaultLayers() -> [AmbientLayerSetting] {
        [
            AmbientLayerKind.piano.defaultSetting(isEnabled: false, volume: 0.22),
            AmbientLayerKind.rain.defaultSetting(isEnabled: true, volume: 0.46),
            AmbientLayerKind.brownNoise.defaultSetting(isEnabled: true, volume: 0.32),
            AmbientLayerKind.whiteNoise.defaultSetting(isEnabled: false, volume: 0.08)
        ]
    }

    func makeMix(from layers: [AmbientLayerSetting], sessionProgress: Double) -> [AmbientLayerMix] {
        mixedLayers(
            from: layers,
            gains: [
                .piano: (0.88, 0.74),
                .rain: (1.00, 1.12),
                .brownNoise: (0.92, 1.06),
                .whiteNoise: (0.74, 0.54)
            ],
            sessionProgress: sessionProgress
        )
    }

    func makeAtmosphere(
        from layers: [AmbientLayerSetting],
        sessionProgress: Double,
        sessionState: FocusSessionState,
        earnedStars: Int
    ) -> RoomAtmosphere {
        let clampedProgress = clamped(sessionProgress)
        let mix = makeMix(from: layers, sessionProgress: clampedProgress)

        return RoomAtmosphere(
            progress: clampedProgress,
            lampWarmth: 0.18 + (clampedProgress * 0.34),
            backgroundDepth: 0.28 + (clampedProgress * 0.42),
            rainIntensity: max(0.12, level(for: .rain, in: mix) + 0.10),
            pianoIsSpinning: level(for: .piano, in: mix) > 0.06,
            earnedStars: max(earnedStars, sessionState == .completed ? 1 : 0),
            backgroundBlur: 15 - (clampedProgress * 6),
            colorTemperature: 0.14 + (clampedProgress * 0.48),
            grainIntensity: max(0.03, 0.15 - (clampedProgress * 0.09))
        )
    }
}
