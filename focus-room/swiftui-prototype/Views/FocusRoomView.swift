import SwiftUI

struct FocusRoomView: View {
    @ObservedObject var viewModel: FocusRoomViewModel

    var body: some View {
        ZStack {
            RoomBackgroundView(atmosphere: viewModel.atmosphere)

            LinearGradient(
                colors: [
                    Color.black.opacity(0.06),
                    Color.black.opacity(0.16 + viewModel.atmosphere.backgroundDepth * 0.18)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                HStack(alignment: .top, spacing: 20) {
                    GhostGlassPanel(opacity: max(viewModel.controlsOpacity, 0.34)) {
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

                    Spacer()

                    FocusTimerView(
                        formattedTime: viewModel.formattedRemainingTime,
                        progress: viewModel.progress,
                        statusText: viewModel.statusText,
                        selectedPreset: viewModel.selectedPreset,
                        customMinutes: viewModel.customMinutes,
                        customOptions: viewModel.supportedCustomDurations,
                        primaryActionTitle: viewModel.primaryActionTitle,
                        ghostOpacity: max(viewModel.controlsOpacity, 0.34),
                        onSelectPreset: viewModel.selectPreset,
                        onSelectCustomMinutes: viewModel.setCustomMinutes,
                        onPrimaryAction: viewModel.toggleSession,
                        onReset: viewModel.resetSession
                    )
                    .frame(maxWidth: 320)
                }
                .padding(.horizontal, 28)
                .padding(.top, 24)

                Spacer()

                HStack(alignment: .bottom, spacing: 20) {
                    AmbientMixerView(
                        layers: viewModel.ambientLayers,
                        ghostOpacity: max(viewModel.controlsOpacity, 0.3),
                        onToggle: viewModel.toggleLayer,
                        onVolumeChange: { kind, volume in
                            viewModel.setVolume(for: kind, volume: volume)
                        }
                    )
                    .frame(maxWidth: 440)

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
                .onChanged { _ in
                    viewModel.registerInteraction()
                }
        )
        .task {
            viewModel.registerInteraction()
        }
    }
}

#Preview {
    FocusRoomView(viewModel: PreviewContent.roomViewModel())
}
