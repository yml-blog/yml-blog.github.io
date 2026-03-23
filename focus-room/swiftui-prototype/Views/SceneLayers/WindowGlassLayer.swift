import SwiftUI

struct WindowGlassLayer: View {
    let atmosphere: RoomAtmosphere
    let time: TimeInterval

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color.white.opacity(0.12),
                    Color.white.opacity(0.02),
                    Color.white.opacity(0.08)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .blendMode(.screen)

            Canvas(rendersAsynchronously: true) { context, size in
                let dropletCount = Int(10 + (atmosphere.rainDepth * 16))

                for index in 0..<dropletCount {
                    let seed = Double(index)
                    let x = 12 + (glassRandom(seed * 3.13) * Double(size.width - 24))
                    let speed = 10 + (glassRandom(seed * 7.41) * 18) + (atmosphere.rainDepth * 8)
                    let offset = glassRandom(seed * 12.27) * Double(size.height + 260)
                    let y = ((time * speed) + offset).truncatingRemainder(dividingBy: Double(size.height + 260)) - 110
                    let trailLength = 28 + (glassRandom(seed * 4.77) * 48) + (atmosphere.rainDepth * 24)
                    let drift = (glassRandom(seed * 5.91) - 0.5) * 8
                    let start = CGPoint(x: CGFloat(x), y: CGFloat(y - (trailLength * 0.22)))
                    let end = CGPoint(x: CGFloat(x + drift), y: CGFloat(y + trailLength))
                    let control = CGPoint(x: CGFloat(x + (drift * 0.8)), y: CGFloat(y + (trailLength * 0.48)))
                    var path = Path()
                    path.move(to: start)
                    path.addQuadCurve(to: end, control: control)

                    let opacity = 0.14 + (glassRandom(seed * 9.21) * 0.14) + (atmosphere.rainDepth * 0.16)
                    context.stroke(
                        path,
                        with: .linearGradient(
                            Gradient(colors: [
                                Color.white.opacity(opacity),
                                Color.white.opacity(opacity * 0.08)
                            ]),
                            startPoint: start,
                            endPoint: end
                        ),
                        style: StrokeStyle(lineWidth: CGFloat(1.3 + (glassRandom(seed * 15.81) * 1.1)), lineCap: .round)
                    )

                    let dropRect = CGRect(x: CGFloat(x - 2.4), y: CGFloat(y - 4), width: 4.8, height: 7.8)
                    context.fill(Path(ellipseIn: dropRect), with: .color(Color.white.opacity(opacity + 0.06)))
                }
            }

            LinearGradient(
                colors: [
                    Color.white.opacity(0.18),
                    Color.clear,
                    Color.white.opacity(0.04)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .blendMode(.screen)

            Ellipse()
                .fill(Color.white.opacity(0.06 + atmosphere.rainDepth * 0.08))
                .frame(width: 180, height: 42)
                .blur(radius: 24)
                .offset(x: -22, y: -84)
        }
        .opacity(0.72 + atmosphere.rainDepth * 0.18)
    }
}

private func glassRandom(_ seed: Double) -> Double {
    let raw = sin(seed) * 9421.113
    return raw - floor(raw)
}
