import SwiftUI

@MainActor
final class AppState: ObservableObject {
    @Published var focusRoom: FocusRoomViewModel

    init(
        store: FocusRoomPreferencesStoring = UserDefaultsPreferencesStore(),
        audioEngine: AmbientAudioControlling = MockAmbientAudioEngine()
    ) {
        focusRoom = FocusRoomViewModel(preferencesStore: store, audioEngine: audioEngine)
    }
}
