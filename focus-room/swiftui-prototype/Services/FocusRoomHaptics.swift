import Foundation

#if canImport(UIKit)
import UIKit
#endif

#if canImport(AppKit)
import AppKit
#endif

enum FocusRoomHaptics {
    static func prepareThreshold() {
        #if canImport(UIKit)
        soft.prepare()
        medium.prepare()
        rigid.prepare()
        #endif
    }

    static func holdPulse(progress: Double) {
        #if canImport(UIKit)
        let clampedProgress = min(max(progress, 0), 1)
        let generator: UIImpactFeedbackGenerator

        switch clampedProgress {
        case ..<0.45:
            generator = soft
        case ..<0.82:
            generator = medium
        default:
            generator = rigid
        }

        generator.prepare()
        generator.impactOccurred(intensity: CGFloat(0.22 + (clampedProgress * 0.72)))
        #elseif canImport(AppKit)
        let pattern: NSHapticFeedbackManager.FeedbackPattern = progress > 0.82 ? .levelChange : .alignment
        NSHapticFeedbackManager.defaultPerformer.perform(pattern, performanceTime: .now)
        #else
        let _ = progress
        #endif
    }

    static func entryImpact() {
        #if canImport(UIKit)
        rigid.prepare()
        rigid.impactOccurred(intensity: 0.96)
        #elseif canImport(AppKit)
        NSHapticFeedbackManager.defaultPerformer.perform(.levelChange, performanceTime: .now)
        #endif
    }
}

#if canImport(UIKit)
private extension FocusRoomHaptics {
    static let soft = UIImpactFeedbackGenerator(style: .soft)
    static let medium = UIImpactFeedbackGenerator(style: .medium)
    static let rigid = UIImpactFeedbackGenerator(style: .rigid)
}
#endif
