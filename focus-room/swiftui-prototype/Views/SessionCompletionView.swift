import SwiftUI

struct SessionCompletionView: View {
    let message: String

    var body: some View {
        GhostGlassPanel {
            VStack(alignment: .leading, spacing: 12) {
                Text("Complete")
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundStyle(FocusRoomTheme.textSecondary)
                    .tracking(2)
                    .textCase(.uppercase)

                Text(message)
                    .font(.system(size: 18, weight: .medium, design: .rounded))
                    .foregroundStyle(FocusRoomTheme.textPrimary)

                HStack(spacing: 8) {
                    Circle()
                        .fill(FocusRoomTheme.lampGold)
                        .frame(width: 5, height: 5)
                        .shadow(color: FocusRoomTheme.accent.opacity(0.5), radius: 8)

                    Text("The room settles into a softer glow.")
                        .font(.system(size: 12, weight: .medium, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textSecondary)
                }
            }
            .frame(maxWidth: 220, alignment: .leading)
        }
    }
}

#Preview {
    SessionCompletionView(message: "Good work. Take a breath.")
        .padding()
        .background(FocusRoomTheme.backgroundDeep)
}
