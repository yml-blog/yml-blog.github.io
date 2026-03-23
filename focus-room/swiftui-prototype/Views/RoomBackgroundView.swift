import SwiftUI

struct RoomBackgroundView: View {
    let atmosphere: RoomAtmosphere

    var body: some View {
        GeometryReader { proxy in
            TimelineView(.animation(minimumInterval: 1.0 / 30.0, paused: false)) { context in
                let time = context.date.timeIntervalSinceReferenceDate
                let sceneWidth = min(proxy.size.width * 0.92, 1180)
                let sceneHeight = min(proxy.size.height * 0.86, 840)
                let wallWidth = sceneWidth * 0.88
                let wallHeight = sceneHeight * 0.72
                let windowWidth = sceneWidth * 0.34
                let windowHeight = sceneHeight * 0.40
                let deskWidth = sceneWidth * 0.78
                let deskHeight = sceneHeight * 0.22

                ZStack {
                    backgroundField(time: time)

                    ZStack {
                        roomShadow(width: sceneWidth, height: sceneHeight)

                        wall(width: wallWidth, height: wallHeight)
                            .offset(y: -sceneHeight * 0.05)

                        windowSpillLight(sceneWidth: sceneWidth, sceneHeight: sceneHeight)
                            .offset(y: -sceneHeight * 0.06)

                        windowAssembly(width: windowWidth, height: windowHeight, time: time)
                            .offset(x: -sceneWidth * 0.11, y: -sceneHeight * 0.16)

                        DeskSurfaceLayer(
                            atmosphere: atmosphere,
                            width: deskWidth,
                            height: deskHeight
                        )
                        .offset(y: sceneHeight * 0.24)

                        DeskReflectionLayer(
                            atmosphere: atmosphere,
                            width: deskWidth,
                            height: deskHeight
                        )
                        .offset(y: sceneHeight * 0.20)

                        LampView(atmosphere: atmosphere, time: time)
                            .offset(x: sceneWidth * 0.18, y: sceneHeight * 0.05)

                        rewardMarks(sceneWidth: sceneWidth, sceneHeight: sceneHeight, time: time)

                        completionVeil(sceneWidth: sceneWidth, sceneHeight: sceneHeight)
                    }
                    .frame(width: sceneWidth, height: sceneHeight)

                    vignette
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .ignoresSafeArea()
    }

    private func backgroundField(time: TimeInterval) -> some View {
        let temperature = atmosphere.colorTemperature
        let blurRadius = CGFloat(atmosphere.backgroundBlur)

        return ZStack {
            LinearGradient(
                colors: [
                    sceneBlendColor(from: (0.08, 0.11, 0.16), to: (0.07, 0.10, 0.19), amount: temperature),
                    sceneBlendColor(from: (0.04, 0.06, 0.10), to: (0.03, 0.05, 0.12), amount: temperature),
                    sceneBlendColor(from: (0.02, 0.03, 0.06), to: (0.02, 0.03, 0.08), amount: temperature)
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            Circle()
                .fill(FocusRoomTheme.windowGlow.opacity(0.12 + atmosphere.skyGlow * 0.18))
                .frame(width: 540, height: 540)
                .blur(radius: 130 + blurRadius)
                .offset(x: -260, y: -260)

            Circle()
                .fill(FocusRoomTheme.accent.opacity(0.05 + atmosphere.lampWarmth * 0.10))
                .frame(width: 420, height: 420)
                .blur(radius: 100)
                .offset(x: 260, y: -160)

            RoundedRectangle(cornerRadius: 160, style: .continuous)
                .fill(Color.white.opacity(0.035))
                .frame(width: 280, height: 220)
                .blur(radius: 72 + (blurRadius * 0.4))
                .offset(x: CGFloat(sin(time * 0.08) * 36), y: CGFloat(cos(time * 0.06) * 24))

            Ellipse()
                .fill(Color.black.opacity(0.38 + atmosphere.backgroundDepth * 0.16))
                .frame(width: 1120, height: 620)
                .blur(radius: 130)
                .offset(y: 360)

            grainOverlay(time: time)
                .opacity(atmosphere.grainIntensity)
                .blendMode(.softLight)
        }
    }

    private func wall(width: CGFloat, height: CGFloat) -> some View {
        ZStack(alignment: .bottom) {
            RoundedRectangle(cornerRadius: 74, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            sceneBlendColor(from: (0.18, 0.23, 0.31), to: (0.20, 0.20, 0.28), amount: atmosphere.colorTemperature).opacity(0.95),
                            sceneBlendColor(from: (0.09, 0.11, 0.17), to: (0.10, 0.09, 0.14), amount: atmosphere.colorTemperature).opacity(0.98),
                            sceneBlendColor(from: (0.05, 0.06, 0.10), to: (0.06, 0.05, 0.08), amount: atmosphere.colorTemperature)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 74, style: .continuous)
                        .stroke(Color.white.opacity(0.05), lineWidth: 1)
                )

            LinearGradient(
                colors: [
                    Color.black.opacity(0),
                    Color.black.opacity(0.14),
                    Color.black.opacity(0.28)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .clipShape(RoundedRectangle(cornerRadius: 74, style: .continuous))

            RoundedRectangle(cornerRadius: 34, style: .continuous)
                .fill(Color.white.opacity(0.025))
                .frame(width: width * 0.92, height: height * 0.08)
                .blur(radius: 30)
                .offset(y: -height * 0.20)
        }
        .frame(width: width, height: height)
        .shadow(color: .black.opacity(0.28), radius: 40, x: 0, y: 26)
    }

    private func roomShadow(width: CGFloat, height: CGFloat) -> some View {
        Ellipse()
            .fill(Color.black.opacity(0.48))
            .frame(width: width * 0.76, height: height * 0.16)
            .blur(radius: 30)
            .offset(y: height * 0.36)
    }

    private func windowSpillLight(sceneWidth: CGFloat, sceneHeight: CGFloat) -> some View {
        ZStack {
            Ellipse()
                .fill(FocusRoomTheme.windowGlow.opacity(0.10 + atmosphere.skyGlow * 0.18))
                .frame(width: sceneWidth * 0.28, height: sceneHeight * 0.42)
                .blur(radius: 34)
                .offset(x: -sceneWidth * 0.12, y: -sceneHeight * 0.16)

            Ellipse()
                .fill(FocusRoomTheme.windowGlow.opacity(0.05 + atmosphere.skyGlow * 0.10))
                .frame(width: sceneWidth * 0.40, height: sceneHeight * 0.12)
                .blur(radius: 22)
                .offset(x: -sceneWidth * 0.08, y: sceneHeight * 0.12)
        }
        .blendMode(.screen)
    }

    private func windowAssembly(width: CGFloat, height: CGFloat, time: TimeInterval) -> some View {
        ZStack {
            OutsideSkyLayer(atmosphere: atmosphere, time: time)

            RainFieldLayer(atmosphere: atmosphere, time: time)

            WindowGlassLayer(atmosphere: atmosphere, time: time)

            Rectangle()
                .fill(Color.white.opacity(0.06))
                .frame(width: 1.5)

            Rectangle()
                .fill(Color.white.opacity(0.05))
                .frame(height: 1.5)
        }
        .frame(width: width, height: height)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(Color.white.opacity(0.09), lineWidth: 1)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(Color.black.opacity(0.24), lineWidth: 10)
                .blur(radius: 8)
                .mask(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .stroke(lineWidth: 14)
                )
        )
        .shadow(color: .black.opacity(0.34), radius: 24, x: 0, y: 16)
    }

    private func rewardMarks(sceneWidth: CGFloat, sceneHeight: CGFloat, time: TimeInterval) -> some View {
        HStack(spacing: 12) {
            ForEach(0..<atmosphere.earnedStars, id: \.self) { index in
                Circle()
                    .fill(FocusRoomTheme.lampGold.opacity(0.58 + (sin(time * 0.6 + Double(index)) * 0.08)))
                    .frame(width: 6, height: 6)
                    .shadow(color: FocusRoomTheme.accent.opacity(0.28), radius: 8)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(
            Capsule(style: .continuous)
                .fill(Color.white.opacity(atmosphere.earnedStars > 0 ? 0.05 : 0))
        )
        .opacity(atmosphere.earnedStars > 0 ? min(1, 0.40 + atmosphere.completionSoftness) : 0)
        .offset(x: sceneWidth * 0.22, y: -sceneHeight * 0.24)
    }

    private func completionVeil(sceneWidth: CGFloat, sceneHeight: CGFloat) -> some View {
        ZStack {
            Ellipse()
                .fill(FocusRoomTheme.accent.opacity(atmosphere.completionSoftness * 0.12))
                .frame(width: sceneWidth * 0.48, height: sceneHeight * 0.22)
                .blur(radius: 36)
                .offset(x: sceneWidth * 0.10, y: sceneHeight * 0.14)

            Ellipse()
                .fill(Color.white.opacity(atmosphere.completionSoftness * 0.05))
                .frame(width: sceneWidth * 0.56, height: sceneHeight * 0.28)
                .blur(radius: 52)
                .offset(y: sceneHeight * 0.10)
        }
        .blendMode(.screen)
    }

    private var vignette: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    colors: [
                        Color.black.opacity(0.10),
                        Color.clear,
                        Color.black.opacity(0.26)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .ignoresSafeArea()
    }

    private func grainOverlay(time: TimeInterval) -> some View {
        Canvas(rendersAsynchronously: true) { context, size in
            for index in 0..<92 {
                let seed = Double(index)
                let x = scenePseudoRandom(seed * 13.17 + time * 0.10) * size.width
                let y = scenePseudoRandom(seed * 22.91 + time * 0.08 + 9) * size.height
                let edge = 1 + scenePseudoRandom(seed * 4.41) * 1.6
                let opacity = atmosphere.grainIntensity * (0.16 + scenePseudoRandom(seed * 8.33 + time * 0.05) * 0.34)
                let rect = CGRect(x: x, y: y, width: edge, height: edge)
                context.fill(Path(rect), with: .color(Color.white.opacity(opacity)))
            }
        }
    }
}

private func sceneBlendColor(
    from cold: (Double, Double, Double),
    to warm: (Double, Double, Double),
    amount: Double
) -> Color {
    let clampedAmount = min(max(amount, 0), 1)
    return Color(
        red: cold.0 + ((warm.0 - cold.0) * clampedAmount),
        green: cold.1 + ((warm.1 - cold.1) * clampedAmount),
        blue: cold.2 + ((warm.2 - cold.2) * clampedAmount)
    )
}

private func scenePseudoRandom(_ seed: Double) -> CGFloat {
    let raw = sin(seed) * 43758.5453123
    return CGFloat(raw - floor(raw))
}

#Preview {
    RoomBackgroundView(
        atmosphere: RoomAtmosphere(
            progress: 0.42,
            lampWarmth: 0.55,
            backgroundDepth: 0.4,
            rainIntensity: 0.6,
            rainDepth: 0.58,
            skyGlow: 0.46,
            deskReflectionWarmth: 0.48,
            completionSoftness: 0.16,
            pianoIsSpinning: true,
            earnedStars: 1,
            backgroundBlur: 10,
            colorTemperature: 0.58,
            grainIntensity: 0.06
        )
    )
}
