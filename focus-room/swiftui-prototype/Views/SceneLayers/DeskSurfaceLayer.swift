import SwiftUI

struct DeskSurfaceLayer: View {
    let atmosphere: RoomAtmosphere
    let width: CGFloat
    let height: CGFloat

    var body: some View {
        ZStack(alignment: .top) {
            RoundedRectangle(cornerRadius: 34, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            FocusRoomTheme.woodLight.opacity(0.98),
                            sceneWoodColor(warmth: atmosphere.colorTemperature, darken: 0.10),
                            FocusRoomTheme.woodDark
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 34, style: .continuous)
                        .stroke(Color.white.opacity(0.05), lineWidth: 1)
                )

            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color.white.opacity(0.05))
                .frame(width: width * 0.92, height: height * 0.10)
                .blur(radius: 18)
                .offset(y: 10)

            HStack {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(Color.black.opacity(0.20))
                    .frame(width: width * 0.22, height: height * 0.18)

                Spacer()

                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Color.white.opacity(0.10))
                    .frame(width: width * 0.16, height: height * 0.10)

                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color.white.opacity(0.12))
                    .frame(width: width * 0.06, height: height * 0.20)
            }
            .padding(.horizontal, width * 0.08)
            .offset(y: height * 0.22)
        }
        .frame(width: width, height: height)
        .shadow(color: .black.opacity(0.26), radius: 22, x: 0, y: 18)
    }
}

private func sceneWoodColor(warmth: Double, darken: Double) -> Color {
    let clampedWarmth = min(max(warmth, 0), 1)
    return Color(
        red: 0.28 + (clampedWarmth * 0.10) - darken,
        green: 0.19 + (clampedWarmth * 0.08) - darken,
        blue: 0.13 + (clampedWarmth * 0.05) - darken
    )
}
