import SwiftUI

struct AmbientMixerView: View {
    let layers: [AmbientLayerSetting]
    let ghostOpacity: Double
    let onToggle: (AmbientLayerKind) -> Void
    let onVolumeChange: (AmbientLayerKind, Double) -> Void

    var body: some View {
        GhostGlassPanel(opacity: ghostOpacity) {
            VStack(alignment: .leading, spacing: 16) {
                Text("Ambient Mixer")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundStyle(FocusRoomTheme.textSecondary)
                    .tracking(2)
                    .textCase(.uppercase)

                Text("Each layer can stay almost invisible until the user reaches for it.")
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundStyle(FocusRoomTheme.textSecondary)

                ForEach(layers) { layer in
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 14) {
                            ZStack {
                                Circle()
                                    .fill(layer.kind.tint.opacity(0.16))
                                Image(systemName: layer.kind.symbolName)
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundStyle(layer.kind.tint)
                            }
                            .frame(width: 38, height: 38)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(layer.kind.title)
                                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                                    .foregroundStyle(FocusRoomTheme.textPrimary)

                                Text(layer.kind.subtitle)
                                    .font(.system(size: 12, weight: .medium, design: .rounded))
                                    .foregroundStyle(FocusRoomTheme.textSecondary)
                            }

                            Spacer()

                            Toggle("", isOn: Binding(
                                get: { layer.isEnabled },
                                set: { _ in onToggle(layer.kind) }
                            ))
                            .labelsHidden()
                            .tint(layer.kind.tint)
                        }

                        HStack(spacing: 12) {
                            Slider(
                                value: Binding(
                                    get: { layer.volume },
                                    set: { onVolumeChange(layer.kind, $0) }
                                ),
                                in: 0...1
                            )
                            .tint(layer.kind.tint)
                            .disabled(!layer.isEnabled)
                            .opacity(layer.isEnabled ? 1 : 0.35)

                            Text("\(Int(layer.volume * 100))%")
                                .font(.system(size: 12, weight: .semibold, design: .rounded))
                                .foregroundStyle(FocusRoomTheme.textSecondary)
                                .frame(width: 40, alignment: .trailing)
                        }
                    }
                    .padding(14)
                    .background(Color.white.opacity(0.03), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .stroke(Color.white.opacity(0.05), lineWidth: 1)
                    )
                }
            }
        }
    }
}

#Preview {
    AmbientMixerView(
        layers: .focusRoomDefaults,
        ghostOpacity: 1,
        onToggle: { _ in },
        onVolumeChange: { _, _ in }
    )
    .padding()
    .background(FocusRoomTheme.backgroundDeep)
}
