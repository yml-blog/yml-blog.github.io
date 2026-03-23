import SwiftUI

struct RoomBackgroundView: View {
    let atmosphere: RoomAtmosphere

    var body: some View {
        GeometryReader { proxy in
            TimelineView(.animation(minimumInterval: 1.0 / 24.0, paused: false)) { context in
                let time = context.date.timeIntervalSinceReferenceDate
                let roomWidth = min(proxy.size.width * 0.84, 980)
                let roomHeight = min(proxy.size.height * 0.82, 760)

                ZStack {
                    backgroundField(time: time)

                    ZStack {
                        RoundedRectangle(cornerRadius: 42, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        blendedColor(
                                            from: (0.08, 0.11, 0.18),
                                            to: (0.05, 0.08, 0.16),
                                            amount: atmosphere.colorTemperature * 0.7
                                        ),
                                        blendedColor(
                                            from: (0.04, 0.05, 0.10),
                                            to: (0.03, 0.04, 0.08),
                                            amount: atmosphere.colorTemperature * 0.5
                                        )
                                    ],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 42, style: .continuous)
                                    .stroke(Color.white.opacity(0.05), lineWidth: 1)
                            )

                        wallLayer
                        windowView(width: roomWidth * 0.31, height: roomHeight * 0.28, time: time)
                            .offset(y: -roomHeight * 0.13)

                        lampGlow(time: time)
                            .offset(x: roomWidth * 0.22, y: -roomHeight * 0.05)

                        deskLayer(width: roomWidth, height: roomHeight)

                        recordPlayer(time: time)
                            .offset(x: -roomWidth * 0.25, y: roomHeight * 0.21)

                        deskBook
                            .offset(x: roomWidth * 0.18, y: roomHeight * 0.23)

                        deskCup
                            .offset(x: roomWidth * 0.28, y: roomHeight * 0.21)

                        if atmosphere.earnedStars > 0 {
                            stickyNote
                                .offset(x: roomWidth * 0.24, y: -roomHeight * 0.10)
                                .transition(.opacity)
                        }

                        starField(time: time, roomWidth: roomWidth, roomHeight: roomHeight)
                    }
                    .frame(width: roomWidth, height: roomHeight)
                    .shadow(color: .black.opacity(0.36), radius: 40, x: 0, y: 30)
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
                    blendedColor(from: (0.11, 0.13, 0.17), to: (0.05, 0.08, 0.17), amount: temperature),
                    blendedColor(from: (0.07, 0.09, 0.13), to: (0.03, 0.06, 0.15), amount: temperature),
                    blendedColor(from: (0.03, 0.04, 0.07), to: (0.01, 0.03, 0.10), amount: temperature)
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            ZStack {
                Circle()
                    .fill(blendedColor(from: (0.54, 0.60, 0.68), to: (0.33, 0.43, 0.68), amount: temperature).opacity(0.16))
                    .frame(width: 440, height: 440)
                    .blur(radius: 120 + blurRadius)
                    .offset(x: -220, y: -250)

                Circle()
                    .fill(blendedColor(from: (0.78, 0.70, 0.60), to: (0.64, 0.59, 0.72), amount: temperature * 0.66).opacity(0.16 + atmosphere.progress * 0.07))
                    .frame(width: 360, height: 360)
                    .blur(radius: 96 + (blurRadius * 0.65))
                    .offset(x: 220, y: -180)

                Circle()
                    .fill(Color.black.opacity(0.32 + atmosphere.backgroundDepth * 0.24))
                    .frame(width: 780, height: 780)
                    .blur(radius: 120 + (blurRadius * 0.45))
                    .offset(y: 380)

                RoundedRectangle(cornerRadius: 80, style: .continuous)
                    .fill(blendedColor(from: (0.82, 0.86, 0.92), to: (0.42, 0.51, 0.70), amount: temperature * 0.7).opacity(0.04))
                    .frame(width: 260, height: 260)
                    .blur(radius: 54 + (blurRadius * 0.35))
                    .offset(x: sin(time * 0.12) * 40, y: cos(time * 0.08) * 24)
            }

            grainOverlay(time: time)
                .opacity(atmosphere.grainIntensity)
                .blendMode(.softLight)

            LinearGradient(
                colors: [
                    Color.black.opacity(0.02),
                    Color.black.opacity(0.12 + atmosphere.backgroundDepth * 0.16)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }

    private var wallLayer: some View {
        RoundedRectangle(cornerRadius: 38, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [
                        blendedColor(from: (0.16, 0.21, 0.31), to: (0.12, 0.16, 0.29), amount: atmosphere.colorTemperature * 0.72).opacity(0.9),
                        blendedColor(from: (0.07, 0.09, 0.14), to: (0.04, 0.06, 0.12), amount: atmosphere.colorTemperature * 0.7).opacity(0.98)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .padding(.horizontal, 22)
            .padding(.top, 22)
            .padding(.bottom, 170)
    }

    private func windowView(width: CGFloat, height: CGFloat, time: TimeInterval) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            blendedColor(from: (0.15, 0.24, 0.34), to: (0.10, 0.16, 0.30), amount: atmosphere.colorTemperature).opacity(0.88),
                            blendedColor(from: (0.04, 0.06, 0.10), to: (0.02, 0.04, 0.10), amount: atmosphere.colorTemperature).opacity(0.98)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(Color.white.opacity(0.08), lineWidth: 1)
                )

            Rectangle()
                .fill(Color.white.opacity(0.05))
                .frame(width: 1)

            Rectangle()
                .fill(Color.white.opacity(0.05))
                .frame(height: 1)

            ForEach(0..<14, id: \.self) { index in
                Capsule(style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [FocusRoomTheme.rain.opacity(0.84), FocusRoomTheme.rain.opacity(0)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(width: 1.4, height: CGFloat(42 + (index % 4) * 12))
                    .offset(
                        x: (-width * 0.42) + CGFloat(index) * (width / 14),
                        y: CGFloat((time * (60 + Double(index * 6))).truncatingRemainder(dividingBy: Double(height + 120))) - height / 2 - 60
                    )
                    .rotationEffect(.degrees(12))
                    .opacity(0.16 + atmosphere.rainIntensity * 0.7)
            }
        }
        .frame(width: width, height: height)
        .shadow(color: .black.opacity(0.3), radius: 24, x: 0, y: 16)
    }

    private func lampGlow(time: TimeInterval) -> some View {
        let pulse = 0.9 + (sin(time * 0.55) * 0.05)

        return ZStack {
            Circle()
                .fill(FocusRoomTheme.accent.opacity(0.16 + atmosphere.lampWarmth * 0.18))
                .frame(width: 140 * pulse, height: 140 * pulse)
                .blur(radius: 10)

            Circle()
                .fill(blendedColor(from: (1.0, 0.92, 0.77), to: (1.0, 0.89, 0.72), amount: atmosphere.colorTemperature))
                .frame(width: 20, height: 20)
                .shadow(color: FocusRoomTheme.accent.opacity(0.7), radius: 24)
        }
    }

    private func deskLayer(width: CGFloat, height: CGFloat) -> some View {
        RoundedRectangle(cornerRadius: 28, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [
                        blendedColor(from: (0.37, 0.27, 0.20), to: (0.35, 0.25, 0.19), amount: atmosphere.colorTemperature * 0.48),
                        blendedColor(from: (0.19, 0.13, 0.09), to: (0.16, 0.11, 0.09), amount: atmosphere.colorTemperature * 0.48)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .frame(width: width * 0.78, height: height * 0.18)
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(Color.white.opacity(0.04), lineWidth: 1)
            )
            .offset(y: height * 0.26)
            .shadow(color: .black.opacity(0.26), radius: 18, x: 0, y: 16)
    }

    private func recordPlayer(time: TimeInterval) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.black.opacity(0.18))
                .frame(width: 116, height: 82)

            Circle()
                .fill(
                    RadialGradient(
                        colors: [
                            Color.white.opacity(0.24),
                            Color(red: 0.10, green: 0.12, blue: 0.16)
                        ],
                        center: .center,
                        startRadius: 3,
                        endRadius: 34
                    )
                )
                .frame(width: 64, height: 64)
                .overlay(
                    Circle()
                        .stroke(Color.white.opacity(0.06), lineWidth: 1)
                )
                .rotationEffect(.degrees(atmosphere.pianoIsSpinning ? time * 8 : 0))

            Circle()
                .fill(Color.white.opacity(0.76))
                .frame(width: 7, height: 7)
        }
    }

    private var deskBook: some View {
        RoundedRectangle(cornerRadius: 10, style: .continuous)
            .fill(Color.white.opacity(0.10))
            .frame(width: 94, height: 16)
    }

    private var deskCup: some View {
        RoundedRectangle(cornerRadius: 10, style: .continuous)
            .fill(Color.white.opacity(0.12))
            .frame(width: 26, height: 34)
    }

    private var stickyNote: some View {
        Text("Good work.\nTake a breath.")
            .font(.system(size: 12, weight: .medium, design: .rounded))
            .foregroundStyle(Color(red: 1, green: 0.94, blue: 0.78))
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(Color(red: 0.72, green: 0.56, blue: 0.33).opacity(0.18))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(Color.white.opacity(0.08), lineWidth: 1)
            )
    }

    private func starField(time: TimeInterval, roomWidth: CGFloat, roomHeight: CGFloat) -> some View {
        let starOffsets: [CGPoint] = [
            CGPoint(x: -0.33, y: -0.33),
            CGPoint(x: -0.10, y: -0.38),
            CGPoint(x: 0.14, y: -0.30),
            CGPoint(x: 0.32, y: -0.24)
        ]

        return ZStack {
            ForEach(Array(starOffsets.enumerated()), id: \.offset) { index, point in
                Circle()
                    .fill(FocusRoomTheme.textPrimary.opacity(0.72 + (sin(time + Double(index)) * 0.1)))
                    .frame(width: 4, height: 4)
                    .shadow(color: FocusRoomTheme.accent.opacity(0.34), radius: 8)
                    .offset(x: roomWidth * point.x, y: roomHeight * point.y)
            }

            ForEach(0..<atmosphere.earnedStars, id: \.self) { index in
                Circle()
                    .fill(FocusRoomTheme.accent)
                    .frame(width: 5, height: 5)
                    .shadow(color: FocusRoomTheme.accent.opacity(0.45), radius: 10)
                    .offset(
                        x: roomWidth * (0.22 + CGFloat(index) * 0.06),
                        y: roomHeight * (-0.39 + CGFloat(index % 2) * 0.03)
                    )
            }
        }
    }

    private func grainOverlay(time: TimeInterval) -> some View {
        Canvas(rendersAsynchronously: true) { context, size in
            for index in 0..<96 {
                let seed = Double(index)
                let x = pseudoRandom(seed * 17.13 + time * 0.12) * size.width
                let y = pseudoRandom(seed * 29.41 + time * 0.09 + 7) * size.height
                let edge = 1 + pseudoRandom(seed * 11.19) * 1.8
                let opacity = atmosphere.grainIntensity * (0.22 + pseudoRandom(seed * 5.17 + time * 0.05) * 0.44)
                let rect = CGRect(x: x, y: y, width: edge, height: edge)
                context.fill(Path(rect), with: .color(Color.white.opacity(opacity)))
            }
        }
    }

    private func blendedColor(
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

    private func pseudoRandom(_ seed: Double) -> CGFloat {
        let raw = sin(seed) * 43758.5453123
        return CGFloat(raw - floor(raw))
    }
}

#Preview {
    RoomBackgroundView(
        atmosphere: RoomAtmosphere(
            progress: 0.42,
            lampWarmth: 0.55,
            backgroundDepth: 0.4,
            rainIntensity: 0.6,
            pianoIsSpinning: true,
            earnedStars: 1,
            backgroundBlur: 10,
            colorTemperature: 0.58,
            grainIntensity: 0.06
        )
    )
}
