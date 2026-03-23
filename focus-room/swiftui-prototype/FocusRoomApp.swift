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
                    .transition(.asymmetric(insertion: .opacity, removal: .focusRoomSink))
            case .room:
                FocusRoomView(viewModel: viewModel)
                    .transition(.focusRoomSubmerge)
            }
        }
        .animation(.spring(response: 1.34, dampingFraction: 0.95, blendDuration: 0.16), value: viewModel.phase)
    }
}

private struct FocusRoomSubmergeModifier: ViewModifier {
    let blurRadius: CGFloat
    let scale: CGFloat
    let verticalOffset: CGFloat
    let opacity: Double
    let saturation: Double

    func body(content: Content) -> some View {
        content
            .scaleEffect(scale)
            .blur(radius: blurRadius)
            .offset(y: verticalOffset)
            .opacity(opacity)
            .saturation(saturation)
    }
}

private extension AnyTransition {
    static var focusRoomSubmerge: AnyTransition {
        .modifier(
            active: FocusRoomSubmergeModifier(
                blurRadius: 24,
                scale: 1.018,
                verticalOffset: 26,
                opacity: 0,
                saturation: 0.92
            ),
            identity: FocusRoomSubmergeModifier(
                blurRadius: 0,
                scale: 1,
                verticalOffset: 0,
                opacity: 1,
                saturation: 1
            )
        )
    }

    static var focusRoomSink: AnyTransition {
        .modifier(
            active: FocusRoomSubmergeModifier(
                blurRadius: 18,
                scale: 0.972,
                verticalOffset: 18,
                opacity: 0,
                saturation: 0.86
            ),
            identity: FocusRoomSubmergeModifier(
                blurRadius: 0,
                scale: 1,
                verticalOffset: 0,
                opacity: 1,
                saturation: 1
            )
        )
    }
}

#Preview("Threshold") {
    FocusRoomRootView(viewModel: PreviewContent.thresholdViewModel())
}

#Preview("Room") {
    FocusRoomRootView(viewModel: PreviewContent.roomViewModel())
}
