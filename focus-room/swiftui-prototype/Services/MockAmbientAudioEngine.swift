import Foundation

protocol AmbientAudioControlling: AnyObject {
    func updateLayers(_ layers: [AmbientLayerSetting], animated: Bool)
    func setPreviewLevel(_ level: Double)
    func fadeOutAll(duration: TimeInterval)
}

@MainActor
final class MockAmbientAudioEngine: AmbientAudioControlling, ObservableObject {
    @Published private(set) var previewLevel: Double = 0
    @Published private(set) var activeLevels: [AmbientLayerKind: Double] = [:]

    func updateLayers(_ layers: [AmbientLayerSetting], animated: Bool) {
        let nextLevels = Dictionary(uniqueKeysWithValues: layers.map { layer in
            (layer.kind, layer.isEnabled ? layer.volume : 0)
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
