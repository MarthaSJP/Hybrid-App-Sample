import Testing
@testable import NativeBridgeCore

@Test("dispatch routes to matching handler")
func dispatchRoutesToHandler() async throws {
    let dispatcher = CommandDispatcher(handlers: [GetDeviceInfoHandler()])
    let request = CommandRequest(id: "1", method: "getDeviceInfo")

    let response = await dispatcher.dispatch(request)

    #expect(response.ok)
    #expect(response.error == nil)
    #expect(response.id == "1")
}

@Test("dispatch returns method not found for unknown method")
func dispatchReturnsMethodNotFound() async throws {
    let dispatcher = CommandDispatcher(handlers: [GetDeviceInfoHandler()])
    let request = CommandRequest(id: "2", method: "unknownMethod")

    let response = await dispatcher.dispatch(request)

    #expect(response.ok == false)
    #expect(response.error?.code == "METHOD_NOT_FOUND")
}

@Test("triggerHaptic validates style payload")
func triggerHapticValidation() async throws {
    let handler = TriggerHapticHandler()

    let badRequest = CommandRequest(id: "3", method: "triggerHaptic", payload: ["style": AnyCodable("invalid")])
    let badResponse = await handler.handle(badRequest)

    #expect(badResponse.ok == false)
    #expect(badResponse.error?.code == "BAD_REQUEST")

    let goodRequest = CommandRequest(id: "4", method: "triggerHaptic", payload: ["style": AnyCodable("light")])
    let goodResponse = await handler.handle(goodRequest)

    #expect(goodResponse.ok)
}
