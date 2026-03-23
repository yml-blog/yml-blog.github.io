# Focus Room SwiftUI Prototype

This folder contains a production-style first-pass SwiftUI prototype for `Focus Room`.

## Included

- `FocusRoomApp.swift`: app entry and threshold-to-room root transition
- `App/AppState.swift`: top-level dependency ownership
- `Design/FocusRoomTheme.swift`: shared colors and gradients
- `Models/`: ambient layers, preferences, phase, timer state, room atmosphere
- `Services/`: local persistence and mock audio hooks
- `ViewModels/FocusRoomViewModel.swift`: session orchestration, ghost UI, persistence
- `Views/`: threshold, main room, timer, mixer, background, completion, ghost panel
- `SampleData/PreviewContent.swift`: preview-safe sample states

## Notes

- Persistence uses `UserDefaults` through `FocusRoomPreferencesStoring`.
- Audio is intentionally mocked so the prototype stays useful without bundled assets.
- Replacing `MockAmbientAudioEngine` with a real fade-aware playback engine is the clean next step.
