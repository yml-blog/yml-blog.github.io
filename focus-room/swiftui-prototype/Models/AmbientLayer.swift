import SwiftUI

enum AmbientLayerKind: String, CaseIterable, Codable, Identifiable {
    case piano
    case rain
    case brownNoise
    case cafe
    case whiteNoise

    var id: String { rawValue }

    var title: String {
        switch self {
        case .piano:
            return "Piano"
        case .rain:
            return "Rain"
        case .brownNoise:
            return "Brown Noise"
        case .cafe:
            return "Cafe"
        case .whiteNoise:
            return "White Noise"
        }
    }

    var subtitle: String {
        switch self {
        case .piano:
            return "Soft vinyl piano"
        case .rain:
            return "Window-side rainfall"
        case .brownNoise:
            return "Low sheltering bed"
        case .cafe:
            return "Distant room texture"
        case .whiteNoise:
            return "Clean edge for focus"
        }
    }

    var symbolName: String {
        switch self {
        case .piano:
            return "pianokeys"
        case .rain:
            return "cloud.rain"
        case .brownNoise:
            return "waveform.path.ecg"
        case .cafe:
            return "cup.and.saucer"
        case .whiteNoise:
            return "waveform"
        }
    }

    var tint: Color {
        switch self {
        case .piano:
            return FocusRoomTheme.accent
        case .rain:
            return FocusRoomTheme.rain
        case .brownNoise:
            return Color(red: 0.74, green: 0.69, blue: 0.85)
        case .cafe:
            return Color(red: 0.87, green: 0.74, blue: 0.58)
        case .whiteNoise:
            return Color(red: 0.82, green: 0.88, blue: 0.94)
        }
    }

    var defaultVolume: Double {
        switch self {
        case .piano:
            return 0.42
        case .rain:
            return 0.58
        case .brownNoise:
            return 0.34
        case .cafe:
            return 0.18
        case .whiteNoise:
            return 0.12
        }
    }

    var defaultEnabled: Bool {
        switch self {
        case .piano, .rain, .brownNoise:
            return true
        case .cafe, .whiteNoise:
            return false
        }
    }
}

struct AmbientLayerSetting: Identifiable, Codable, Equatable {
    let kind: AmbientLayerKind
    var isEnabled: Bool
    var volume: Double

    var id: AmbientLayerKind { kind }
}

extension Array where Element == AmbientLayerSetting {
    static var focusRoomDefaults: [AmbientLayerSetting] {
        AmbientLayerKind.allCases.map { kind in
            AmbientLayerSetting(
                kind: kind,
                isEnabled: kind.defaultEnabled,
                volume: kind.defaultVolume
            )
        }
    }

    func setting(for kind: AmbientLayerKind) -> AmbientLayerSetting {
        first(where: { $0.kind == kind }) ?? AmbientLayerSetting(
            kind: kind,
            isEnabled: kind.defaultEnabled,
            volume: kind.defaultVolume
        )
    }
}
