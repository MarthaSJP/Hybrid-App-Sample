import Foundation

public struct CommandRequest: Equatable {
    public let id: String
    public let method: String
    public let payload: [String: AnyCodable]?

    public init(id: String, method: String, payload: [String: AnyCodable]? = nil) {
        self.id = id
        self.method = method
        self.payload = payload
    }

    public init?(from body: Any) {
        guard let dict = body as? [String: Any],
              let id = dict["id"] as? String,
              let method = dict["method"] as? String
        else {
            return nil
        }

        let payloadDict = dict["payload"] as? [String: Any]
        let payload = payloadDict?.mapValues(AnyCodable.init)
        self.init(id: id, method: method, payload: payload)
    }
}

public struct BridgeError: Equatable {
    public let code: String
    public let message: String

    public init(code: String, message: String) {
        self.code = code
        self.message = message
    }

    public static func methodNotFound(_ method: String) -> BridgeError {
        BridgeError(code: "METHOD_NOT_FOUND", message: "Unsupported method: \(method)")
    }

    public static func badRequest(_ message: String) -> BridgeError {
        BridgeError(code: "BAD_REQUEST", message: message)
    }

    public static func internalError(_ message: String) -> BridgeError {
        BridgeError(code: "INTERNAL_ERROR", message: message)
    }
}

public struct CommandResponse: Equatable {
    public let id: String
    public let ok: Bool
    public let result: [String: AnyCodable]?
    public let error: BridgeError?

    public init(id: String, ok: Bool, result: [String: AnyCodable]? = nil, error: BridgeError? = nil) {
        self.id = id
        self.ok = ok
        self.result = result
        self.error = error
    }

    public func asDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "id": id,
            "ok": ok
        ]

        if let result {
            dict["result"] = result.mapValues { $0.value }
        }

        if let error {
            dict["error"] = [
                "code": error.code,
                "message": error.message
            ]
        }

        return dict
    }
}

public struct AnyCodable: Equatable {
    public let value: Any

    public init(_ value: Any) {
        self.value = value
    }

    public static func == (lhs: AnyCodable, rhs: AnyCodable) -> Bool {
        switch (lhs.value, rhs.value) {
        case let (l as String, r as String):
            return l == r
        case let (l as Int, r as Int):
            return l == r
        case let (l as Double, r as Double):
            return l == r
        case let (l as Bool, r as Bool):
            return l == r
        default:
            return false
        }
    }
}
