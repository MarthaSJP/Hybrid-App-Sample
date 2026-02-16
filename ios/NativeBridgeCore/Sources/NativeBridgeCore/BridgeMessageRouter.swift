import Foundation
import WebKit

public final class BridgeMessageRouter: NSObject, WKScriptMessageHandler {
    private let dispatcher: CommandDispatcher
    private let emitResponse: (CommandResponse) -> Void

    public init(dispatcher: CommandDispatcher, emitResponse: @escaping (CommandResponse) -> Void) {
        self.dispatcher = dispatcher
        self.emitResponse = emitResponse
    }

    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // nativeBridge以外のメッセージはこのルーターでは処理しない。
        guard message.name == "nativeBridge" else {
            return
        }

        // JSから受け取ったbodyを、Bridge仕様のCommandRequestへ変換する。
        guard let request = CommandRequest(from: message.body) else {
            emitResponse(
                CommandResponse(
                    id: "unknown",
                    ok: false,
                    error: .badRequest("invalid message body")
                )
            )
            return
        }

        Task {
            // methodに対応するHandlerへ委譲し、結果をWebへ返す。
            let response = await dispatcher.dispatch(request)
            emitResponse(response)
        }
    }
}
