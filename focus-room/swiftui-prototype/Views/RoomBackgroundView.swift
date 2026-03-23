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
                                        Color(red: 0.08, green: 0.11, blue: 0.18),
                                        Color(red: 0.04, green: 0.05, blue: 0.10)
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
        ZStack {
            LinearGradient(
                colors: [
                    FocusRoomTheme.background,
                    FocusRoomTheme.backgroundDeep.opacity(0.96)
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            Circle()
                .fill(FocusRoomTheme.rain.opacity(0.15))
                .frame(width: 420, height: 420)
                .blur(radius: 120)
                .offset(x: -220, y: -250)

            Circle()
                .fill(FocusRoomTheme.accent.opacity(0.18 + atmosphere.progress * 0.08))
                .frame(width: 320, height: 320)
                .blur(radius: 90)
                .offset(x: 220, y: -180)

            Circle()
                .fill(Color.black.opacity(0.38 + atmosphere.backgroundDepth * 0.2))
                .frame(width: 760, height: 760)
                .blur(radius: 120)
                .offset(y: 380)

            RoundedRectangle(cornerRadius: 80, style: .continuous)
                .fill(Color.white.opacity(0.02))
                .frame(width: 260, height: 260)
                .blur(radius: 60)
                .offset(x: sin(time * 0.12) * 40, y: cos(time * 0.08) * 24)
        }
    }

    private var wallLayer: some View {
        RoundedRectangle(cornerRadius: 38, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [
                        Color(red: 0.16, green: 0.21, blue: 0.31).opacity(0.9),
                        Color(red: 0.07, green: 0.09, blue: 0.14).opacity(0.98)
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
                            Color(red: 0.15, green: 0.24, blue: 0.34).opacity(0.88),
                            Color(red: 0.04, green: 0.06, blue: 0.10).opacity(0.98)
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
                    .opacity(0.3 + atmosphere.rainIntensity * 0.7)
            }
        }
        .frame(width: width, height: height)
        .shadow(color: .black.opacity(0.3), radius: 24, x: 0, y: 16)
    }

    private func lampGlow(time: TimeInterval) -> some View {
        let pulse = 0.9 + (sin(time * 0.55) * 0.05)

        return ZStack {
            Circle()
                .fill(FocusRoomTheme.accent.opacity(0.18 + atmosphere.lampWarmth * 0.14))
                .frame(width: 140 * pulse, height: 140 * pulse)
                .blur(radius: 10)

            Circle()
                .fill(Color(red: 1, green: 0.92, blue: 0.77))
                .frame(width: 20, height: 20)
                .shadow(color: FocusRoomTheme.accent.opacity(0.7), radius: 24)
        }
    }

    private func deskLayer(width: CGFloat, height: CGFloat) -> some View {
        RoundedRectangle(cornerRadius: 28, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [
                        Color(red: 0.37, green: 0.27, blue: 0.20),
                        Color(red: 0.19, green: 0.13, blue: 0.09)
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
                    .fill(FocusRoomTheme.textPrimary.opacity(0.76 + (sin(time + Double(index)) * 0.1)))
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
}

#Preview {
    RoomBackgroundView(
        atmosphere: RoomAtmosphere(
            progress: 0.42,
            lampWarmth: 0.55,
            backgroundDepth: 0.4,
            rainIntensity: 0.6,
            pianoIsSpinning: true,
            earnedStars: 1
        )
    )
}
