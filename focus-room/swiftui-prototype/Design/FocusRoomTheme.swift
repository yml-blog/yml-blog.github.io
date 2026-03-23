import SwiftUI

enum FocusRoomTheme {
    static let background = Color(red: 0.04, green: 0.06, blue: 0.10)
    static let backgroundDeep = Color(red: 0.02, green: 0.03, blue: 0.06)
    static let mist = Color(red: 0.55, green: 0.63, blue: 0.73)
    static let accent = Color(red: 0.86, green: 0.68, blue: 0.47)
    static let accentSoft = Color(red: 0.86, green: 0.68, blue: 0.47, opacity: 0.18)
    static let rain = Color(red: 0.62, green: 0.76, blue: 0.88)
    static let textPrimary = Color(red: 0.96, green: 0.93, blue: 0.88)
    static let textSecondary = Color(red: 0.72, green: 0.77, blue: 0.83)
    static let panel = Color.white.opacity(0.06)
    static let panelBorder = Color.white.opacity(0.09)
    static let timerGradient = LinearGradient(
        colors: [rain, accent],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
