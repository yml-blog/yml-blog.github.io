import SwiftUI

struct ThresholdView: View {
    @ObservedObject var viewModel: FocusRoomViewModel
    @State private var isPressing = false

    var body: some View {
        ZStack {
            RoomBackgroundView(atmosphere: previewAtmosphere)
                .blur(radius: max(8, 22 - (viewModel.holdProgress * 14)))
                .scaleEffect(1.04)
                .overlay(Color.black.opacity(0.34))

            VStack(spacing: 24) {
                Spacer()

                ZStack {
                    Circle()
                        .fill(FocusRoomTheme.accent.opacity(0.10 + viewModel.holdProgress * 0.18))
                        .frame(width: 230, height: 230)
                        .blur(radius: 10)

                    Circle()
                        .stroke(Color.white.opacity(0.08), lineWidth: 1)
                        .frame(width: 220, height: 220)

                    Circle()
                        .trim(from: 0, to: max(viewModel.holdProgress, 0.03))
                        .stroke(
                            FocusRoomTheme.timerGradient,
                            style: StrokeStyle(lineWidth: 4, lineCap: .round)
                        )
                        .frame(width: 220, height: 220)
                        .rotationEffect(.degrees(-90))

                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [
                                    Color.white.opacity(0.18 + viewModel.holdProgress * 0.1),
                                    FocusRoomTheme.accent.opacity(0.18 + viewModel.holdProgress * 0.22),
                                    Color.clear
                                ],
                                center: .center,
                                startRadius: 10,
                                endRadius: 96
                            )
                        )
                        .frame(width: 188, height: 188)

                    Circle()
                        .fill(Color.white.opacity(0.04))
                        .frame(width: 136, height: 136)
                }
                .contentShape(Circle())
                .gesture(holdGesture)

                VStack(spacing: 10) {
                    Text("Focus Room")
                        .font(.system(size: 58, weight: .regular, design: .serif))
                        .foregroundStyle(FocusRoomTheme.textPrimary)

                    Text("A quiet room for deep work.")
                        .font(.system(size: 18, weight: .medium, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textSecondary)

                    Text(isPressing ? "The room is opening softly." : "Hold to Enter")
                        .font(.system(size: 13, weight: .semibold, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textSecondary)
                        .tracking(2)
                        .textCase(.uppercase)
                }

                Button(action: {}) {
                    Text("Hold to Enter")
                        .font(.system(size: 15, weight: .semibold, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textPrimary)
                        .frame(width: 196, height: 52)
                        .background(
                            Capsule(style: .continuous)
                                .fill(Color.white.opacity(0.05))
                        )
                        .overlay(
                            Capsule(style: .continuous)
                                .stroke(Color.white.opacity(0.08), lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)
                .contentShape(Capsule())
                .gesture(holdGesture)

                Spacer()
            }
            .padding(28)
        }
        .ignoresSafeArea()
        .onDisappear {
            viewModel.cancelEntryHold()
        }
    }

    private var holdGesture: some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { _ in
                guard !isPressing else { return }
                isPressing = true
                viewModel.beginEntryHold()
            }
            .onEnded { _ in
                isPressing = false
                viewModel.cancelEntryHold()
            }
    }

    private var previewAtmosphere: RoomAtmosphere {
        RoomAtmosphere(
            progress: 0.12 + (viewModel.holdProgress * 0.18),
            lampWarmth: 0.24 + (viewModel.holdProgress * 0.2),
            backgroundDepth: 0.18 + (viewModel.holdProgress * 0.14),
            rainIntensity: 0.34 + (viewModel.holdProgress * 0.2),
            pianoIsSpinning: true,
            earnedStars: 0
        )
    }
}

#Preview {
    ThresholdView(viewModel: PreviewContent.thresholdViewModel())
}
