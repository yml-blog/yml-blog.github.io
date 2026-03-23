import SwiftUI

struct GhostGlassPanel<Content: View>: View {
    let opacity: Double
    private let content: Content

    init(opacity: Double = 1, @ViewBuilder content: () -> Content) {
        self.opacity = opacity
        self.content = content()
    }

    var body: some View {
        content
            .padding(20)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
            .background(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(FocusRoomTheme.panel)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(FocusRoomTheme.panelBorder, lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.24), radius: 28, x: 0, y: 18)
            .opacity(opacity)
    }
}
