import type { CommandRequest, CommandResponse, DeviceInfo, HapticStyle, MobileAgentContext } from "./types";

const BRIDGE_HANDLER_NAME = "nativeBridge";
const DEFAULT_TIMEOUT_MS = 5000;

function randomId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type PendingRequest = {
  resolve: (response: CommandResponse) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

export class NativeBridgeClient {
  // リクエストID単位でPromiseを保持し、Nativeからの応答と突合する。
  private static pending = new Map<string, PendingRequest>();

  constructor(private timeoutMs = DEFAULT_TIMEOUT_MS) {
    NativeBridgeClient.installGlobalHandler();
  }

  send(method: string, payload?: unknown): Promise<CommandResponse> {
    const request: CommandRequest = {
      id: randomId(),
      method,
      payload
    };

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        NativeBridgeClient.pending.delete(request.id);
        reject(new Error(`TIMEOUT: request ${request.id} exceeded ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      NativeBridgeClient.pending.set(request.id, { resolve, reject, timeoutId });

      const host = globalThis as typeof globalThis & { webkit?: any };
      const webkit = host.webkit;
      const handler = webkit?.messageHandlers?.[BRIDGE_HANDLER_NAME];
      if (!handler || typeof handler.postMessage !== "function") {
        clearTimeout(timeoutId);
        NativeBridgeClient.pending.delete(request.id);
        reject(new Error("Native bridge handler is not available"));
        return;
      }

      // JS -> Native の送信形式: postMessage(CommandRequest)
      handler.postMessage(request);
    });
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    const response = await this.send("getDeviceInfo");
    if (!response.ok || !response.result) {
      throw new Error(response.error?.message ?? "getDeviceInfo failed");
    }

    return response.result as unknown as DeviceInfo;
  }

  async triggerHaptic(style: HapticStyle): Promise<void> {
    const response = await this.send("triggerHaptic", { style });
    if (!response.ok) {
      throw new Error(response.error?.message ?? "triggerHaptic failed");
    }
  }

  async getMobileAgentContext(): Promise<MobileAgentContext> {
    const response = await this.send("getMobileAgentContext");
    if (!response.ok || !response.result) {
      throw new Error(response.error?.message ?? "getMobileAgentContext failed");
    }

    return response.result as unknown as MobileAgentContext;
  }

  private static installGlobalHandler(): void {
    const host = globalThis as typeof globalThis & { onNativeMessage?: (response: CommandResponse) => void };
    // Native -> JS の受信形式: window.onNativeMessage(CommandResponse)
    host.onNativeMessage = (response: CommandResponse) => {
      NativeBridgeClient.handleNativeMessage(response);
    };
  }

  private static handleNativeMessage(response: CommandResponse): void {
    // レスポンスIDに対応する保留中リクエストを解決/失敗させる。
    const pending = NativeBridgeClient.pending.get(response.id);
    if (!pending) {
      return;
    }

    clearTimeout(pending.timeoutId);
    NativeBridgeClient.pending.delete(response.id);

    if (response.ok) {
      pending.resolve(response);
      return;
    }

    pending.reject(new Error(response.error?.message ?? "Unknown native error"));
  }
}
