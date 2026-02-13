import Foundation

public protocol NativeCommandHandler {
    func canHandle(_ method: String) -> Bool
    func handle(_ request: CommandRequest) async -> CommandResponse
}
