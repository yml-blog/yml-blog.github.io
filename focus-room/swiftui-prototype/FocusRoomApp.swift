import SwiftUI

@main
struct FocusRoomApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            FocusRoomRootView(viewModel: appState.focusRoom)
                .preferredColorScheme(.dark)
        }
    }
}

struct FocusRoomRootView: View {
    @ObservedObject var viewModel: FocusRoomViewModel

    var body: some View {
        ZStack {
            switch viewModel.phase {
            case .threshold:
                ThresholdView(viewModel: viewModel)
                    .transition(.opacity.combined(with: .scale(scale: 1.01)))
            case .room:
                FocusRoomView(viewModel: viewModel)
                    .transition(.opacity)
            }
        }
        .animation(.spring(response: 1.0, dampingFraction: 0.92), value: viewModel.phase)
    }
}

#Preview("Threshold") {
    FocusRoomRootView(viewModel: PreviewContent.thresholdViewModel())
}

#Preview("Room") {
    FocusRoomRootView(viewModel: PreviewContent.roomViewModel())
}
