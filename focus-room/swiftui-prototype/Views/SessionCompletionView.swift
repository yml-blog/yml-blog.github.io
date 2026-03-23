import SwiftUI

struct SessionCompletionView: View {
    let message: String

    var body: some View {
        GhostGlassPanel {
            VStack(alignment: .leading, spacing: 12) {
                Text("Session Complete")
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                    .foregroundStyle(FocusRoomTheme.textSecondary)
                    .tracking(2)
                    .textCase(.uppercase)

                Text(message)
                    .font(.system(size: 21, weight: .medium, design: .rounded))
                    .foregroundStyle(FocusRoomTheme.textPrimary)

                HStack(spacing: 8) {
                    Circle()
                        .fill(FocusRoomTheme.accent)
                        .frame(width: 6, height: 6)
                        .shadow(color: FocusRoomTheme.accent.opacity(0.7), radius: 8)

                    Text("A quiet mark remains in the room.")
                        .font(.system(size: 13, weight: .medium, design: .rounded))
                        .foregroundStyle(FocusRoomTheme.textSecondary)
                }
            }
            .frame(maxWidth: 240, alignment: .leading)
        }
    }
}

#Preview {
    SessionCompletionView(message: "Good work. Take a breath.")
        .padding()
        .background(FocusRoomTheme.backgroundDeep)
}
