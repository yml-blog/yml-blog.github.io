import Foundation

enum FocusRoomPhase: String, Codable {
    case threshold
    case room
}

enum FocusSessionState: String, Codable {
    case idle
    case running
    case paused
    case completed
}

enum SessionLengthPreset: String, CaseIterable, Codable, Identifiable {
    case minutes25
    case minutes50
    case custom

    var id: String { rawValue }

    var title: String {
        switch self {
        case .minutes25:
            return "25"
        case .minutes50:
            return "50"
        case .custom:
            return "Custom"
        }
    }

    func resolvedMinutes(customMinutes: Int) -> Int {
        switch self {
        case .minutes25:
            return 25
        case .minutes50:
            return 50
        case .custom:
            return max(10, customMinutes)
        }
    }
}

struct FocusRoomPreferences: Codable, Equatable {
    var roomKind: FocusRoomKind
    var selectedPreset: SessionLengthPreset
    var customMinutes: Int
    var layers: [AmbientLayerSetting]

    var resolvedMinutes: Int {
        selectedPreset.resolvedMinutes(customMinutes: customMinutes)
    }

    init(
        roomKind: FocusRoomKind = .study,
        selectedPreset: SessionLengthPreset,
        customMinutes: Int,
        layers: [AmbientLayerSetting]
    ) {
        self.roomKind = roomKind
        self.selectedPreset = selectedPreset
        self.customMinutes = customMinutes
        self.layers = layers
    }

    private enum CodingKeys: String, CodingKey {
        case roomKind
        case selectedPreset
        case customMinutes
        case layers
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        roomKind = try container.decodeIfPresent(FocusRoomKind.self, forKey: .roomKind) ?? .study
        selectedPreset = try container.decode(SessionLengthPreset.self, forKey: .selectedPreset)
        customMinutes = try container.decode(Int.self, forKey: .customMinutes)
        layers = try container.decode([AmbientLayerSetting].self, forKey: .layers)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(roomKind, forKey: .roomKind)
        try container.encode(selectedPreset, forKey: .selectedPreset)
        try container.encode(customMinutes, forKey: .customMinutes)
        try container.encode(layers, forKey: .layers)
    }

    static let `default` = FocusRoomPreferences(
        roomKind: .study,
        selectedPreset: .minutes25,
        customMinutes: 75,
        layers: StudyRoomSoundscapeStrategy().defaultLayers()
    )
}

struct RoomAtmosphere: Equatable {
    let progress: Double
    let lampWarmth: Double
    let backgroundDepth: Double
    let rainIntensity: Double
    let pianoIsSpinning: Bool
    let earnedStars: Int
    let backgroundBlur: Double
    let colorTemperature: Double
    let grainIntensity: Double
}
