import Foundation
#if canImport(UIKit)
import UIKit
#endif

public struct GetDeviceInfoHandler: NativeCommandHandler {
    public init() {}

    public func canHandle(_ method: String) -> Bool {
        method == "getDeviceInfo"
    }

    public func handle(_ request: CommandRequest) async -> CommandResponse {
        #if canImport(UIKit)
        let device = UIDevice.current
        let result: [String: AnyCodable] = [
            "platform": AnyCodable("iOS"),
            "systemName": AnyCodable(device.systemName),
            "systemVersion": AnyCodable(device.systemVersion),
            "model": AnyCodable(device.model)
        ]
        #else
        let result: [String: AnyCodable] = [
            "platform": AnyCodable("iOS"),
            "systemName": AnyCodable("unknown"),
            "systemVersion": AnyCodable("unknown"),
            "model": AnyCodable("unknown")
        ]
        #endif

        return CommandResponse(id: request.id, ok: true, result: result)
    }
}
