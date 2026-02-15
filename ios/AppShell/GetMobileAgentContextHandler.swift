import NativeBridgeCore
import NewRelic
#if canImport(UIKit)
import UIKit
#endif

struct GetMobileAgentContextHandler: NativeCommandHandler {
    func canHandle(_ method: String) -> Bool {
        method == "getMobileAgentContext"
    }

    func handle(_ request: CommandRequest) async -> CommandResponse {
        let sessionID = resolveSessionID() ?? ""
        let uuid = resolveDeviceUUID() ?? ""

        let result: [String: AnyCodable] = [
            "sessionId": AnyCodable(sessionID),
            "uuid": AnyCodable(uuid)
        ]

        return CommandResponse(id: request.id, ok: true, result: result)
    }

    private func resolveSessionID() -> String? {
        guard let sessionID = NewRelic.currentSessionId(), !sessionID.isEmpty else {
            return nil
        }
        return sessionID
    }

    private func resolveDeviceUUID() -> String? {
        #if canImport(UIKit)
        return UIDevice.current.identifierForVendor?.uuidString
        #else
        return nil
        #endif
    }
}
