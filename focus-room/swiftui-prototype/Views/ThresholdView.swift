import Foundation
import SwiftUI

struct ThresholdView: View {
    @ObservedObject var viewModel: FocusRoomViewModel
    @State private var isPressing = false
    @State private var holdFeedbackIndex = 0
    @State private var didEmitEntryImpact = false

    private let holdFeedbackThresholds: [Double] = [0.18, 0.36, 0.58, 0.78, 0.92]

    var body: some View {
        ZStack {
            RoomBackgroundView(atmosphere: previewAtmosphere)
                .blur(radius: max(6, 20 - (viewModel.holdProgress * 13)))
                .scaleEffect(1.045 - (viewModel.holdProgress * 0.015))
                .overlay(Color.black.opacity(0.34 - (viewModel.holdProgress * 0.08)))

            VStack(spacing: 24) {
                Spacer()

                TimelineView(.animation(minimumInterval: 1.0 / 30.0, paused: !isPressing)) { context in
                    let heartbeat = heartbeatPulse(at: context.date.timeIntervalSinceReferenceDate)

                    ZStack {
                        Circle()
                            .fill(FocusRoomTheme.accent.opacity(0.10 + viewModel.holdProgress * 0.18))
                            .frame(width: 230, height: 230)
                            .blur(radius: 12 + heartbeat * 8)
                            .scaleEffect(1 + heartbeat * (0.06 + viewModel.holdProgress * 0.03))

                        Circle()
                            .stroke(Color.white.opacity(0.08 + heartbeat * 0.04), lineWidth: 1)
                            .frame(width: 220, height: 220)
                            .scaleEffect(1 + heartbeat * 0.018)

                        Circle()
                            .trim(from: 0, to: max(viewModel.holdProgress, 0.03))
                            .stroke(
                                FocusRoomTheme.timerGradient,
                                style: StrokeStyle(
                                    lineWidth: 4 + heartbeat * 1.6,
                                    lineCap: .round
                                )
                            )
                            .frame(width: 220, height: 220)
                            .rotationEffect(.degrees(-90))
                            .shadow(color: FocusRoomTheme.accent.opacity(0.14 + heartbeat * 0.12), radius: 18)

                        Circle()
                            .fill(
                                RadialGradient(
                                    colors: [
                                        Color.white.opacity(0.18 + viewModel.holdProgress * 0.08 + heartbeat * 0.08),
                                        FocusRoomTheme.accent.opacity(0.18 + viewModel.holdProgress * 0.24 + heartbeat * 0.10),
                                        Color.clear
                                    ],
                                    center: .center,
                                    startRadius: 10,
                                    endRadius: 96
                                )
                            )
                            .frame(width: 188, height: 188)
                            .scaleEffect(1 + heartbeat * 0.045)

                        Circle()
                            .fill(Color.white.opacity(0.04 + heartbeat * 0.02))
                            .frame(width: 136, height: 136)
                            .scaleEffect(1 + heartbeat * 0.025)
                    }
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

                    Text(thresholdPrompt)
                        .font(.system(size: 13, weight: .semibold, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textSecondary)
                        .tracking(2)
                        .textCase(.uppercase)
                }

                Button(action: {}) {
                    Text(buttonLabel)
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
        .onChange(of: isPressing) { newValue in
            if newValue {
                FocusRoomHaptics.prepareThreshold()
            } else {
                holdFeedbackIndex = 0
                didEmitEntryImpact = false
            }
        }
        .onChange(of: viewModel.holdProgress) { progress in
            handleHoldProgressChange(progress)
        }
        .onDisappear {
            isPressing = false
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
            progress: 0.10 + (viewModel.holdProgress * 0.24),
            lampWarmth: 0.20 + (viewModel.holdProgress * 0.30),
            backgroundDepth: 0.16 + (viewModel.holdProgress * 0.20),
            rainIntensity: 0.28 + (viewModel.holdProgress * 0.24),
            pianoIsSpinning: true,
            earnedStars: 0,
            backgroundBlur: 17 - (viewModel.holdProgress * 6),
            colorTemperature: 0.14 + (viewModel.holdProgress * 0.44),
            grainIntensity: 0.14 - (viewModel.holdProgress * 0.04)
        )
    }

    private var thresholdPrompt: String {
        if isPressing {
            return viewModel.holdProgress > 0.84
                ? "Almost beneath the surface."
                : "The room is opening softly."
        }

        return "Hold to Enter"
    }

    private var buttonLabel: String {
        isPressing ? "Keep Holding" : "Hold to Enter"
    }

    private func heartbeatPulse(at time: TimeInterval) -> Double {
        guard isPressing else { return 0 }

        let cycle = time.truncatingRemainder(dividingBy: 1.12)
        let primary = exp(-pow((cycle - 0.12) / 0.075, 2))
        let secondary = 0.72 * exp(-pow((cycle - 0.28) / 0.055, 2))
        let intensity = min(1, primary + secondary)

        return intensity * (0.82 + (viewModel.holdProgress * 0.18))
    }

    private func handleHoldProgressChange(_ progress: Double) {
        guard isPressing else { return }

        while holdFeedbackIndex < holdFeedbackThresholds.count,
              progress >= holdFeedbackThresholds[holdFeedbackIndex] {
            let checkpoint = holdFeedbackThresholds[holdFeedbackIndex]
            FocusRoomHaptics.holdPulse(progress: checkpoint)
            holdFeedbackIndex += 1
        }

        if progress >= 0.995, !didEmitEntryImpact {
            FocusRoomHaptics.entryImpact()
            didEmitEntryImpact = true
        }
    }
}

#Preview {
    ThresholdView(viewModel: PreviewContent.thresholdViewModel())
}
