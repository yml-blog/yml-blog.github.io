import SwiftUI

struct LampView: View {
    let atmosphere: RoomAtmosphere
    let time: TimeInterval

    var body: some View {
        let pulse = CGFloat(0.98 + (sin(time * 0.55) * 0.025))
        let warmOpacity = 0.18 + atmosphere.lampWarmth * 0.34

        ZStack(alignment: .bottom) {
            Ellipse()
                .fill(FocusRoomTheme.lampGold.opacity(warmOpacity * 0.65))
                .frame(width: 180, height: 132)
                .blur(radius: 30)
                .offset(x: -46, y: -124)
                .blendMode(.screen)

            Ellipse()
                .fill(FocusRoomTheme.accent.opacity(0.08 + atmosphere.lampWarmth * 0.14))
                .frame(width: 240, height: 74)
                .blur(radius: 26)
                .offset(x: -34, y: -20)
                .blendMode(.screen)

            Capsule(style: .continuous)
                .fill(Color.black.opacity(0.46))
                .frame(width: 78, height: 12)
                .offset(x: 24, y: -4)

            Capsule(style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.14),
                            Color(red: 0.18, green: 0.16, blue: 0.13)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: 12, height: 98)
                .offset(x: 24, y: -54)

            Capsule(style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.16),
                            Color(red: 0.15, green: 0.13, blue: 0.11)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 12, height: 112)
                .rotationEffect(.degrees(-48))
                .offset(x: -8, y: -102)

            ZStack {
                RoundedRectangle(cornerRadius: 30, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(red: 0.17, green: 0.15, blue: 0.13),
                                Color(red: 0.07, green: 0.06, blue: 0.06)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 30, style: .continuous)
                            .stroke(Color.white.opacity(0.08), lineWidth: 1)
                    )

                Ellipse()
                    .fill(FocusRoomTheme.lampGold.opacity(warmOpacity))
                    .frame(width: 58 * pulse, height: 28 * pulse)
                    .blur(radius: 8)
                    .offset(x: -8, y: 8)
                    .blendMode(.screen)

                Circle()
                    .fill(Color.white.opacity(0.78 + atmosphere.lampWarmth * 0.12))
                    .frame(width: 14, height: 14)
                    .shadow(color: FocusRoomTheme.lampGold.opacity(0.58), radius: 14)
                    .offset(x: -12, y: 14)
            }
            .frame(width: 86, height: 56)
            .rotationEffect(.degrees(-16))
            .offset(x: -40, y: -144)
        }
        .frame(width: 260, height: 280, alignment: .bottom)
    }
}
