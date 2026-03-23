import SwiftUI

struct FocusRoomView: View {
    @ObservedObject var viewModel: FocusRoomViewModel
    @State private var isMixerExpanded = false

    var body: some View {
        GeometryReader { proxy in
            roomContent(in: proxy.size)
        }
    }

    @ViewBuilder
    private func roomContent(in size: CGSize) -> some View {
        let timerOpacity = 0.16 + (viewModel.controlsOpacity * 0.56)
        let dockOpacity = 0.18 + (viewModel.controlsOpacity * 0.72)
        let expandedPanelOpacity = isMixerExpanded ? max(0.40, dockOpacity) : dockOpacity

        let baseView = ZStack {
            RoomBackgroundView(atmosphere: viewModel.atmosphere)

            LinearGradient(
                colors: [
                    Color.black.opacity(0.02),
                    Color.black.opacity(0.08 + viewModel.atmosphere.backgroundDepth * 0.14)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                HStack {
                    FocusTimerView(
                        formattedTime: viewModel.formattedRemainingTime,
                        progress: viewModel.progress,
                        statusText: viewModel.statusText,
                        selectedPreset: viewModel.selectedPreset,
                        customMinutes: viewModel.customMinutes,
                        ghostOpacity: timerOpacity
                    )
                    .frame(maxWidth: 220, alignment: .leading)

                    Spacer()
                }
                .padding(.horizontal, 24)
                .padding(.top, 22)

                Spacer()

                overlayStack(
                    size: size,
                    dockOpacity: dockOpacity,
                    panelOpacity: expandedPanelOpacity
                )
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

    @ViewBuilder
    private func overlayStack(size: CGSize, dockOpacity: Double, panelOpacity: Double) -> some View {
        VStack(spacing: 14) {
            if isMixerExpanded || viewModel.completionMessage != nil {
                if size.width > 780 {
                    HStack(alignment: .bottom, spacing: 16) {
                        if isMixerExpanded {
                            AmbientMixerView(
                                layers: viewModel.ambientLayers,
                                ghostOpacity: panelOpacity,
                                onToggle: handleLayerToggle,
                                onVolumeChange: handleVolumeChange
                            )
                            .frame(maxWidth: 340, alignment: .leading)
                            .transition(.opacity.combined(with: .move(edge: .leading)))
                        }

                        Spacer(minLength: 0)

                        if let completionMessage = viewModel.completionMessage {
                            SessionCompletionView(message: completionMessage)
                                .transition(.opacity.combined(with: .move(edge: .trailing)))
                        }
                    }
                } else {
                    VStack(alignment: .trailing, spacing: 12) {
                        if let completionMessage = viewModel.completionMessage {
                            SessionCompletionView(message: completionMessage)
                                .transition(.opacity.combined(with: .move(edge: .trailing)))
                        }

                        if isMixerExpanded {
                            AmbientMixerView(
                                layers: viewModel.ambientLayers,
                                ghostOpacity: panelOpacity,
                                onToggle: handleLayerToggle,
                                onVolumeChange: handleVolumeChange
                            )
                            .frame(maxWidth: 340, alignment: .trailing)
                            .transition(.opacity.combined(with: .move(edge: .bottom)))
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .trailing)
                }
            }

            HStack {
                Spacer(minLength: 0)

                RoomControlDock(
                    selectedPreset: viewModel.selectedPreset,
                    customMinutes: viewModel.customMinutes,
                    customOptions: viewModel.supportedCustomDurations,
                    primaryActionTitle: viewModel.primaryActionTitle,
                    activeLayerCount: viewModel.ambientLayers.filter { $0.isEnabled }.count,
                    isMixerExpanded: isMixerExpanded,
                    isCompact: size.width < 560,
                    ghostOpacity: dockOpacity,
                    onSelectPreset: handlePresetSelection,
                    onSelectCustomMinutes: handleCustomMinutesSelection,
                    onPrimaryAction: {
                        viewModel.toggleSession()
                        viewModel.registerInteraction()
                    },
                    onReset: {
                        viewModel.resetSession()
                        withAnimation(.spring(response: 0.34, dampingFraction: 0.88)) {
                            isMixerExpanded = false
                        }
                    },
                    onToggleMixer: {
                        viewModel.registerInteraction()
                        withAnimation(.spring(response: 0.42, dampingFraction: 0.88)) {
                            isMixerExpanded.toggle()
                        }
                    }
                )
                .frame(maxWidth: min(size.width - 32, 640))

                Spacer(minLength: 0)
            }
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 20)
    }

    private func handlePresetSelection(_ preset: SessionLengthPreset) {
        viewModel.selectPreset(preset)
        viewModel.registerInteraction()
    }

    private func handleCustomMinutesSelection(_ minutes: Int) {
        viewModel.setCustomMinutes(minutes)
        viewModel.selectPreset(.custom)
        viewModel.registerInteraction()
    }

    private func handleLayerToggle(_ kind: AmbientLayerKind) {
        viewModel.toggleLayer(kind)
        viewModel.registerInteraction()
    }

    private func handleVolumeChange(_ kind: AmbientLayerKind, _ volume: Double) {
        viewModel.setVolume(for: kind, volume: volume)
        viewModel.registerInteraction()
    }
}

private struct RoomControlDock: View {
    let selectedPreset: SessionLengthPreset
    let customMinutes: Int
    let customOptions: [Int]
    let primaryActionTitle: String
    let activeLayerCount: Int
    let isMixerExpanded: Bool
    let isCompact: Bool
    let ghostOpacity: Double
    let onSelectPreset: (SessionLengthPreset) -> Void
    let onSelectCustomMinutes: (Int) -> Void
    let onPrimaryAction: () -> Void
    let onReset: () -> Void
    let onToggleMixer: () -> Void

    var body: some View {
        GhostGlassPanel(opacity: ghostOpacity) {
            Group {
                if isCompact {
                    VStack(spacing: 10) {
                        HStack(spacing: 10) {
                            durationMenu

                            Button(primaryActionTitle, action: onPrimaryAction)
                                .buttonStyle(RoomDockPrimaryButtonStyle())
                        }

                        HStack(spacing: 10) {
                            Button("Reset", action: onReset)
                                .buttonStyle(RoomDockSecondaryButtonStyle())

                            mixerButton
                        }
                    }
                } else {
                    HStack(spacing: 12) {
                        durationMenu

                        Button(primaryActionTitle, action: onPrimaryAction)
                            .buttonStyle(RoomDockPrimaryButtonStyle())

                        Button("Reset", action: onReset)
                            .buttonStyle(RoomDockSecondaryButtonStyle())

                        mixerButton
                    }
                }
            }
            .frame(maxWidth: .infinity)
        }
    }

    private var durationMenu: some View {
        Menu {
            Button("25 minutes") {
                onSelectPreset(.minutes25)
            }

            Button("50 minutes") {
                onSelectPreset(.minutes50)
            }

            Divider()

            ForEach(customOptions, id: \.self) { minutes in
                Button("\(minutes) minutes") {
                    onSelectCustomMinutes(minutes)
                }
            }
        } label: {
            HStack(spacing: 8) {
                Text(durationLabel)
                    .font(.system(size: 14, weight: .semibold, design: .rounded))

                Image(systemName: "chevron.down")
                    .font(.system(size: 11, weight: .bold))
            }
            .foregroundStyle(FocusRoomTheme.textPrimary)
            .padding(.horizontal, 14)
            .frame(height: 42)
            .background(Color.white.opacity(0.04), in: Capsule(style: .continuous))
            .overlay(
                Capsule(style: .continuous)
                    .stroke(Color.white.opacity(0.06), lineWidth: 1)
            )
        }
    }

    private var mixerButton: some View {
        Button(action: onToggleMixer) {
            HStack(spacing: 8) {
                Image(systemName: isMixerExpanded ? "slider.horizontal.3.circle.fill" : "slider.horizontal.3")
                    .font(.system(size: 14, weight: .semibold))

                Text(isMixerExpanded ? "Hide Mix" : "Mix")
                    .font(.system(size: 14, weight: .semibold, design: .rounded))

                Text("\(activeLayerCount)")
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundStyle(FocusRoomTheme.textSecondary)
                    .padding(.horizontal, 7)
                    .frame(height: 22)
                    .background(Color.white.opacity(0.06), in: Capsule(style: .continuous))
            }
        }
        .buttonStyle(RoomDockSecondaryButtonStyle())
    }

    private var durationLabel: String {
        switch selectedPreset {
        case .minutes25:
            return "25 min"
        case .minutes50:
            return "50 min"
        case .custom:
            return "\(customMinutes) min"
        }
    }
}

private struct RoomDockPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .semibold, design: .rounded))
            .foregroundStyle(Color.black.opacity(0.88))
            .padding(.horizontal, 16)
            .frame(height: 42)
            .background(
                Capsule(style: .continuous)
                    .fill(FocusRoomTheme.timerGradient)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

private struct RoomDockSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .semibold, design: .rounded))
            .foregroundStyle(FocusRoomTheme.textPrimary)
            .padding(.horizontal, 16)
            .frame(height: 42)
            .background(
                Capsule(style: .continuous)
                    .fill(Color.white.opacity(0.04))
            )
            .overlay(
                Capsule(style: .continuous)
                    .stroke(Color.white.opacity(0.06), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

#Preview {
    FocusRoomView(viewModel: PreviewContent.roomViewModel())
}
