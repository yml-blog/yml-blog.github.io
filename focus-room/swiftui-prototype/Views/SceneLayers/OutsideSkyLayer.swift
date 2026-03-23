import SwiftUI

struct OutsideSkyLayer: View {
    let atmosphere: RoomAtmosphere
    let time: TimeInterval

    var body: some View {
        let drift = CGFloat(sin(time * 0.05))

        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.24, green: 0.34, blue: 0.46).opacity(0.96),
                    Color(red: 0.12, green: 0.18, blue: 0.29).opacity(0.98),
                    Color(red: 0.06, green: 0.09, blue: 0.15)
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            Ellipse()
                .fill(FocusRoomTheme.windowGlow.opacity(0.18 + atmosphere.skyGlow * 0.28))
                .frame(width: 220, height: 180)
                .blur(radius: 32)
                .offset(x: -60, y: -50)

            VStack(spacing: 14) {
                mistBand(width: 260, opacity: 0.10 + atmosphere.rainDepth * 0.10)
                mistBand(width: 210, opacity: 0.08 + atmosphere.rainDepth * 0.08)
                mistBand(width: 290, opacity: 0.06 + atmosphere.rainDepth * 0.10)
            }
            .offset(x: drift * 16, y: 8)

            HStack(alignment: .bottom, spacing: 12) {
                ForEach(0..<8, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 6, style: .continuous)
                        .fill(Color.black.opacity(0.16 + Double(index % 3) * 0.04))
                        .frame(
                            width: CGFloat(18 + (index % 3) * 12),
                            height: CGFloat(34 + ((index * 19) % 78))
                        )
                }
            }
            .blur(radius: 2.5)
            .opacity(0.24 + atmosphere.rainDepth * 0.16)
            .offset(y: 74)

            LinearGradient(
                colors: [
                    Color.white.opacity(0),
                    Color.white.opacity(0.04 + atmosphere.rainDepth * 0.06),
                    Color(red: 0.16, green: 0.18, blue: 0.24).opacity(0.28 + atmosphere.rainDepth * 0.10)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .blendMode(.screen)

            Ellipse()
                .fill(FocusRoomTheme.accent.opacity(atmosphere.completionSoftness * 0.08))
                .frame(width: 200, height: 90)
                .blur(radius: 26)
                .offset(y: 54)
        }
    }

    private func mistBand(width: CGFloat, opacity: Double) -> some View {
        Capsule(style: .continuous)
            .fill(Color.white.opacity(opacity))
            .frame(width: width, height: 32)
            .blur(radius: 22)
    }
}
