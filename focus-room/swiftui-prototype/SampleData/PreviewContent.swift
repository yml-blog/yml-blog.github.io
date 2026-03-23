import SwiftUI

enum PreviewContent {
    @MainActor
    static func thresholdViewModel() -> FocusRoomViewModel {
        let viewModel = FocusRoomViewModel(
            preferencesStore: InMemoryPreferencesStore(),
            audioEngine: MockAmbientAudioEngine()
        )
        viewModel.seedThresholdPreview()
        return viewModel
    }

    @MainActor
    static func roomViewModel() -> FocusRoomViewModel {
        let viewModel = FocusRoomViewModel(
            preferencesStore: InMemoryPreferencesStore(),
            audioEngine: MockAmbientAudioEngine()
        )
        viewModel.seedRoomPreview(progress: 0.38, state: .running)
        return viewModel
    }

    @MainActor
    static func completedRoomViewModel() -> FocusRoomViewModel {
        let viewModel = FocusRoomViewModel(
            preferencesStore: InMemoryPreferencesStore(),
            audioEngine: MockAmbientAudioEngine()
        )
        viewModel.seedRoomPreview(progress: 1, state: .completed)
        return viewModel
    }
}
