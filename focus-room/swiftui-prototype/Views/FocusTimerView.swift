import SwiftUI

struct FocusTimerView: View {
    let formattedTime: String
    let progress: Double
    let statusText: String
    let selectedPreset: SessionLengthPreset
    let customMinutes: Int
    let ghostOpacity: Double

    var body: some View {
        GhostGlassPanel(opacity: ghostOpacity) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Session")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textSecondary)
                        .tracking(2)
                        .textCase(.uppercase)

                    Spacer()

                    Text(statusText)
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textSecondary)
                }

                Text(formattedTime)
                    .font(.system(size: 28, weight: .medium, design: .rounded))
                    .foregroundStyle(FocusRoomTheme.textPrimary)
                    .monospacedDigit()

                Capsule(style: .continuous)
                    .fill(Color.white.opacity(0.06))
                    .frame(height: 5)
                    .overlay(alignment: .leading) {
                        Capsule(style: .continuous)
                            .fill(FocusRoomTheme.timerGradient)
                            .frame(width: max(CGFloat(16), CGFloat(184 * progress)), height: 5)
                    }

                Text(sessionLengthLabel)
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundStyle(FocusRoomTheme.textSecondary)
            }
            .frame(maxWidth: 184, alignment: .leading)
        }
    }

    private var sessionLengthLabel: String {
        switch selectedPreset {
        case .minutes25:
            return "25 minute room"
        case .minutes50:
            return "50 minute room"
        case .custom:
            return "\(customMinutes) minute room"
        }
    }
}

#Preview {
    FocusTimerView(
        formattedTime: "31:42",
        progress: 0.36,
        statusText: "Focusing",
        selectedPreset: .minutes50,
        customMinutes: 75,
        ghostOpacity: 1
    )
    .padding()
    .background(FocusRoomTheme.backgroundDeep)
}
