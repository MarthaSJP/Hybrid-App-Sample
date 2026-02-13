import Foundation

public final class CommandDispatcher {
    private let handlers: [NativeCommandHandler]

    public init(handlers: [NativeCommandHandler]) {
        self.handlers = handlers
    }

    public func dispatch(_ request: CommandRequest) async -> CommandResponse {
        guard let handler = handlers.first(where: { $0.canHandle(request.method) }) else {
            return CommandResponse(id: request.id, ok: false, error: .methodNotFound(request.method))
        }

        return await handler.handle(request)
    }
}
