import SwiftUI

struct RainFieldLayer: View {
    let atmosphere: RoomAtmosphere
    let time: TimeInterval

    var body: some View {
        Canvas(rendersAsynchronously: true) { context, size in
            let streakCount = Int(44 + (atmosphere.rainIntensity * 54) + (atmosphere.rainDepth * 18))

            for index in 0..<streakCount {
                let seed = Double(index)
                let lane = rainRandom(seed * 1.73)
                let cycleOffset = rainRandom(seed * 8.19)
                let speed = 100 + (rainRandom(seed * 2.91) * 180) + (atmosphere.rainDepth * 60)
                let length = 18 + (rainRandom(seed * 5.37) * 34) + (atmosphere.rainIntensity * 18)
                let width = 0.8 + (rainRandom(seed * 9.12) * 1.3)
                let x = ((lane * Double(size.width + 160)) - 80)
                let travel = (time * speed) + (cycleOffset * Double(size.height + 260))
                let y = travel.truncatingRemainder(dividingBy: Double(size.height + 260)) - 120
                let start = CGPoint(x: CGFloat(x), y: CGFloat(y))
                let end = CGPoint(x: CGFloat(x + (length * 0.36)), y: CGFloat(y + length))
                var path = Path()
                path.move(to: start)
                path.addLine(to: end)

                let opacity = 0.16 + (rainRandom(seed * 11.41) * 0.22) + (atmosphere.rainIntensity * 0.16)
                context.stroke(
                    path,
                    with: .linearGradient(
                        Gradient(colors: [
                            FocusRoomTheme.rain.opacity(opacity),
                            FocusRoomTheme.rain.opacity(opacity * 0.08)
                        ]),
                        startPoint: start,
                        endPoint: end
                    ),
                    style: StrokeStyle(lineWidth: CGFloat(width), lineCap: .round)
                )
            }
        }
        .blendMode(.screen)
        .opacity(0.56 + atmosphere.rainDepth * 0.18)
        .blur(radius: 0.3 + atmosphere.rainDepth * 0.4)
    }
}

private func rainRandom(_ seed: Double) -> Double {
    let raw = sin(seed) * 12043.2871
    return raw - floor(raw)
}
