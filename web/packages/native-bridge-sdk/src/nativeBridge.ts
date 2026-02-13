import type { CommandRequest, CommandResponse, DeviceInfo, HapticStyle } from "./types";

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
  private pending = new Map<string, PendingRequest>();
  private host = globalThis as typeof globalThis & { onNativeMessage?: (response: CommandResponse) => void; webkit?: any };

  constructor(private timeoutMs = DEFAULT_TIMEOUT_MS) {
    this.host.onNativeMessage =
      (response: CommandResponse) => {
        this.handleNativeMessage(response);
      };
  }

  send(method: string, payload?: unknown): Promise<CommandResponse> {
    const request: CommandRequest = {
      id: randomId(),
      method,
      payload
    };

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pending.delete(request.id);
        reject(new Error(`TIMEOUT: request ${request.id} exceeded ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      this.pending.set(request.id, { resolve, reject, timeoutId });

      const webkit = this.host.webkit;
      const handler = webkit?.messageHandlers?.[BRIDGE_HANDLER_NAME];
      if (!handler || typeof handler.postMessage !== "function") {
        clearTimeout(timeoutId);
        this.pending.delete(request.id);
        reject(new Error("Native bridge handler is not available"));
        return;
      }

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

  private handleNativeMessage(response: CommandResponse): void {
    const pending = this.pending.get(response.id);
    if (!pending) {
      return;
    }

    clearTimeout(pending.timeoutId);
    this.pending.delete(response.id);

    if (response.ok) {
      pending.resolve(response);
      return;
    }

    pending.reject(new Error(response.error?.message ?? "Unknown native error"));
  }
}
