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
    var selectedPreset: SessionLengthPreset
    var customMinutes: Int
    var layers: [AmbientLayerSetting]

    var resolvedMinutes: Int {
        selectedPreset.resolvedMinutes(customMinutes: customMinutes)
    }

    static let `default` = FocusRoomPreferences(
        selectedPreset: .minutes25,
        customMinutes: 75,
        layers: .focusRoomDefaults
    )
}

struct RoomAtmosphere: Equatable {
    let progress: Double
    let lampWarmth: Double
    let backgroundDepth: Double
    let rainIntensity: Double
    let pianoIsSpinning: Bool
    let earnedStars: Int
}
