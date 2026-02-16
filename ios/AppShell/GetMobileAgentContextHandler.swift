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
        // Mobile AgentのセッションIDをWebへ渡し、Browser Agent側で相関分析に使う。
        let sessionID = resolveSessionID() ?? ""
        // 端末単位の追跡用にVendor IDも併せて返す。
        let uuid = resolveDeviceUUID() ?? ""

        let result: [String: AnyCodable] = [
            "sessionId": AnyCodable(sessionID),
            "uuid": AnyCodable(uuid)
        ]

        return CommandResponse(id: request.id, ok: true, result: result)
    }

    private func resolveSessionID() -> String? {
        // New Relic iOS SDKが管理する現在セッションのIDを取得する。
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
