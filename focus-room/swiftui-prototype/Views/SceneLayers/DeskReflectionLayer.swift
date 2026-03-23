import SwiftUI

struct DeskReflectionLayer: View {
    let atmosphere: RoomAtmosphere
    let width: CGFloat
    let height: CGFloat

    var body: some View {
        ZStack {
            Ellipse()
                .fill(FocusRoomTheme.windowGlow.opacity(0.06 + atmosphere.skyGlow * 0.12))
                .frame(width: width * 0.42, height: height * 0.34)
                .blur(radius: 18)
                .offset(x: -width * 0.16, y: -height * 0.08)

            Ellipse()
                .fill(FocusRoomTheme.accent.opacity(0.04 + atmosphere.deskReflectionWarmth * 0.20))
                .frame(width: width * 0.34, height: height * 0.24)
                .blur(radius: 20)
                .offset(x: width * 0.18, y: -height * 0.10)

            Ellipse()
                .fill(Color.white.opacity(0.02 + atmosphere.progress * 0.04))
                .frame(width: width * 0.54, height: height * 0.18)
                .blur(radius: 24)
                .offset(y: -height * 0.12)

            Ellipse()
                .fill(FocusRoomTheme.lampGold.opacity(atmosphere.completionSoftness * 0.10))
                .frame(width: width * 0.46, height: height * 0.18)
                .blur(radius: 28)
                .offset(x: width * 0.10, y: -height * 0.04)
        }
        .frame(width: width, height: height)
        .blendMode(.screen)
        .mask(
            RoundedRectangle(cornerRadius: 34, style: .continuous)
                .frame(width: width, height: height)
        )
    }
}
