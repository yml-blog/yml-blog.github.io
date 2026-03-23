import Foundation

protocol AmbientAudioControlling: AnyObject {
    func updateMix(_ mix: [AmbientLayerMix], animated: Bool)
    func setPreviewLevel(_ level: Double)
    func fadeOutAll(duration: TimeInterval)
}

@MainActor
final class MockAmbientAudioEngine: AmbientAudioControlling, ObservableObject {
    @Published private(set) var previewLevel: Double = 0
    @Published private(set) var activeLevels: [AmbientLayerKind: Double] = [:]

    func updateMix(_ mix: [AmbientLayerMix], animated: Bool) {
        let _ = animated
        let nextLevels = Dictionary(uniqueKeysWithValues: mix.map { layer in
            (layer.kind, layer.level)
        })

        activeLevels = nextLevels
    }

    func setPreviewLevel(_ level: Double) {
        previewLevel = max(0, min(level, 1))
    }

    func fadeOutAll(duration: TimeInterval) {
        let _ = duration
        previewLevel = 0
        activeLevels = activeLevels.mapValues { _ in 0 }
    }
}
