import Foundation
#if canImport(UIKit)
import UIKit
#endif

public struct TriggerHapticHandler: NativeCommandHandler {
    public init() {}

    public func canHandle(_ method: String) -> Bool {
        method == "triggerHaptic"
    }

    public func handle(_ request: CommandRequest) async -> CommandResponse {
        guard let style = request.payload?["style"]?.value as? String else {
            return CommandResponse(id: request.id, ok: false, error: .badRequest("style is required"))
        }

        #if canImport(UIKit)
        let feedbackStyle: UIImpactFeedbackGenerator.FeedbackStyle
        switch style {
        case "light":
            feedbackStyle = .light
        case "medium":
            feedbackStyle = .medium
        case "heavy":
            feedbackStyle = .heavy
        default:
            return CommandResponse(id: request.id, ok: false, error: .badRequest("unsupported haptic style: \(style)"))
        }

        let generator = UIImpactFeedbackGenerator(style: feedbackStyle)
        generator.prepare()
        generator.impactOccurred()
        #else
        switch style {
        case "light", "medium", "heavy":
            break
        default:
            return CommandResponse(id: request.id, ok: false, error: .badRequest("unsupported haptic style: \(style)"))
        }
        #endif

        return CommandResponse(id: request.id, ok: true, result: ["triggered": AnyCodable(true)])
    }
}
