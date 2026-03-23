import SwiftUI

struct FocusRoomView: View {
    @ObservedObject var viewModel: FocusRoomViewModel

    var body: some View {
        GeometryReader { proxy in
            roomContent(in: proxy.size)
        }
    }

    @ViewBuilder
    private func roomContent(in size: CGSize) -> some View {
        let baseView = ZStack {
            RoomBackgroundView(atmosphere: viewModel.atmosphere)

            LinearGradient(
                colors: [
                    Color.black.opacity(0.04),
                    Color.black.opacity(0.12 + viewModel.atmosphere.backgroundDepth * 0.16)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                HStack(alignment: .top, spacing: 20) {
                    GhostGlassPanel(opacity: 0.12 + (viewModel.controlsOpacity * 0.42)) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Focus Room")
                                .font(.system(size: 32, weight: .regular, design: .serif))
                                .foregroundStyle(FocusRoomTheme.textPrimary)

                            Text("A quiet room for deep work.")
                                .font(.system(size: 14, weight: .medium, design: .rounded))
                                .foregroundStyle(FocusRoomTheme.textSecondary)
                        }
                    }
                    .frame(maxWidth: 320, alignment: .leading)
                    .allowsHitTesting(false)

                    Spacer()

                    FocusTimerView(
                        formattedTime: viewModel.formattedRemainingTime,
                        progress: viewModel.progress,
                        statusText: viewModel.statusText,
                        selectedPreset: viewModel.selectedPreset,
                        customMinutes: viewModel.customMinutes,
                        customOptions: viewModel.supportedCustomDurations,
                        primaryActionTitle: viewModel.primaryActionTitle,
                        ghostOpacity: viewModel.controlsOpacity,
                        onSelectPreset: viewModel.selectPreset,
                        onSelectCustomMinutes: viewModel.setCustomMinutes,
                        onPrimaryAction: viewModel.toggleSession,
                        onReset: viewModel.resetSession
                    )
                    .frame(maxWidth: 320)
                    .allowsHitTesting(viewModel.controlsOpacity > 0.04)
                }
                .padding(.horizontal, 28)
                .padding(.top, 24)

                Spacer()

                HStack(alignment: .bottom, spacing: 20) {
                    AmbientMixerView(
                        layers: viewModel.ambientLayers,
                        ghostOpacity: viewModel.controlsOpacity,
                        onToggle: viewModel.toggleLayer,
                        onVolumeChange: { kind, volume in
                            viewModel.setVolume(for: kind, volume: volume)
                        }
                    )
                    .frame(maxWidth: 440)
                    .allowsHitTesting(viewModel.controlsOpacity > 0.04)

                    Spacer()

                    if let completionMessage = viewModel.completionMessage {
                        SessionCompletionView(message: completionMessage)
                            .transition(.opacity.combined(with: .move(edge: .trailing)))
                    }
                }
                .padding(28)
            }
        }
        .contentShape(Rectangle())
        .ignoresSafeArea()
        .onTapGesture {
            viewModel.registerInteraction()
        }
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { value in
                    viewModel.updateGhostProximity(pointerLocation: value.location, in: size)
                }
                .onEnded { _ in
                    viewModel.notePointerExit()
                }
        )

        if #available(iOS 17.0, macOS 14.0, *) {
            baseView.onContinuousHover(coordinateSpace: .local) { phase in
                switch phase {
                case .active(let location):
                    viewModel.updateGhostProximity(pointerLocation: location, in: size)
                case .ended:
                    viewModel.notePointerExit()
                }
            }
        } else {
            baseView
        }
    }
}

#Preview {
    FocusRoomView(viewModel: PreviewContent.roomViewModel())
}
