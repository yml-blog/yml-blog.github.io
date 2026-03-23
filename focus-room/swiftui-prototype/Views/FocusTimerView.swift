import SwiftUI

struct FocusTimerView: View {
    let formattedTime: String
    let progress: Double
    let statusText: String
    let selectedPreset: SessionLengthPreset
    let customMinutes: Int
    let customOptions: [Int]
    let primaryActionTitle: String
    let ghostOpacity: Double
    let onSelectPreset: (SessionLengthPreset) -> Void
    let onSelectCustomMinutes: (Int) -> Void
    let onPrimaryAction: () -> Void
    let onReset: () -> Void

    var body: some View {
        GhostGlassPanel(opacity: ghostOpacity) {
            VStack(alignment: .leading, spacing: 18) {
                HStack {
                    Text("Focus Timer")
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textSecondary)
                        .tracking(2)
                        .textCase(.uppercase)

                    Spacer()

                    Text(statusText)
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textSecondary)
                }

                HStack(spacing: 16) {
                    ZStack {
                        Circle()
                            .stroke(Color.white.opacity(0.08), lineWidth: 7)

                        Circle()
                            .trim(from: 0, to: max(progress, 0.02))
                            .stroke(FocusRoomTheme.timerGradient, style: StrokeStyle(lineWidth: 7, lineCap: .round))
                            .rotationEffect(.degrees(-90))

                        Circle()
                            .fill(FocusRoomTheme.accent.opacity(0.08))
                            .padding(22)
                    }
                    .frame(width: 112, height: 112)

                    VStack(alignment: .leading, spacing: 6) {
                        Text(formattedTime)
                            .font(.system(size: 30, weight: .medium, design: .rounded))
                            .foregroundStyle(FocusRoomTheme.textPrimary)
                            .monospacedDigit()

                        Text("Quietly visible, never dominant.")
                            .font(.system(size: 13, weight: .medium, design: .rounded))
                            .foregroundStyle(FocusRoomTheme.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }

                HStack(spacing: 10) {
                    presetButton(title: "25", isSelected: selectedPreset == .minutes25) {
                        onSelectPreset(.minutes25)
                    }

                    presetButton(title: "50", isSelected: selectedPreset == .minutes50) {
                        onSelectPreset(.minutes50)
                    }

                    Menu {
                        ForEach(customOptions, id: \.self) { minutes in
                            Button("\(minutes) minutes") {
                                onSelectCustomMinutes(minutes)
                                onSelectPreset(.custom)
                            }
                        }
                    } label: {
                        HStack(spacing: 8) {
                            Text(selectedPreset == .custom ? "\(customMinutes)m" : "Custom")
                            Image(systemName: "chevron.down")
                                .font(.system(size: 11, weight: .bold))
                        }
                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                        .foregroundStyle(selectedPreset == .custom ? FocusRoomTheme.textPrimary : FocusRoomTheme.textSecondary)
                        .padding(.horizontal, 14)
                        .frame(height: 38)
                        .background(
                            Capsule(style: .continuous)
                                .fill(selectedPreset == .custom ? FocusRoomTheme.accentSoft : Color.white.opacity(0.04))
                        )
                        .overlay(
                            Capsule(style: .continuous)
                                .stroke(selectedPreset == .custom ? FocusRoomTheme.accent.opacity(0.28) : Color.white.opacity(0.06), lineWidth: 1)
                        )
                    }
                }

                HStack(spacing: 10) {
                    Button(primaryActionTitle, action: onPrimaryAction)
                        .buttonStyle(FocusRoomPrimaryButtonStyle())

                    Button("Reset", action: onReset)
                        .buttonStyle(FocusRoomSecondaryButtonStyle())
                }
            }
        }
    }

    private func presetButton(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .foregroundStyle(isSelected ? FocusRoomTheme.textPrimary : FocusRoomTheme.textSecondary)
                .padding(.horizontal, 16)
                .frame(height: 38)
                .background(
                    Capsule(style: .continuous)
                        .fill(isSelected ? FocusRoomTheme.accentSoft : Color.white.opacity(0.04))
                )
                .overlay(
                    Capsule(style: .continuous)
                        .stroke(isSelected ? FocusRoomTheme.accent.opacity(0.28) : Color.white.opacity(0.06), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}

private struct FocusRoomPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .semibold, design: .rounded))
            .foregroundStyle(Color.black.opacity(0.88))
            .padding(.horizontal, 16)
            .frame(height: 40)
            .background(
                Capsule(style: .continuous)
                    .fill(FocusRoomTheme.timerGradient)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

private struct FocusRoomSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .semibold, design: .rounded))
            .foregroundStyle(FocusRoomTheme.textPrimary)
            .padding(.horizontal, 16)
            .frame(height: 40)
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
    FocusTimerView(
        formattedTime: "31:42",
        progress: 0.36,
        statusText: "Focusing",
        selectedPreset: .minutes50,
        customMinutes: 75,
        customOptions: [45, 60, 75, 90],
        primaryActionTitle: "Pause",
        ghostOpacity: 1,
        onSelectPreset: { _ in },
        onSelectCustomMinutes: { _ in },
        onPrimaryAction: {},
        onReset: {}
    )
    .padding()
    .background(FocusRoomTheme.backgroundDeep)
}
