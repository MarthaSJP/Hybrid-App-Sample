import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NativeBridgeClient } from "../nativeBridge";

declare global {
  interface Window {
    webkit?: any;
    onNativeMessage?: (response: any) => void;
  }
}

describe("NativeBridgeClient", () => {
  const host = globalThis as typeof globalThis & { window?: Window & typeof globalThis };

  beforeEach(() => {
    vi.useFakeTimers();
    host.window = host as Window & typeof globalThis;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete host.window?.webkit;
    delete host.window?.onNativeMessage;
  });

  it("resolves response by matching id", async () => {
    let sentRequest: any;
    host.window!.webkit = {
      messageHandlers: {
        nativeBridge: {
          postMessage: (request: any) => {
            sentRequest = request;
          }
        }
      }
    };

    const client = new NativeBridgeClient();
    const promise = client.send("getDeviceInfo");

    host.window!.onNativeMessage?.({ id: sentRequest.id, ok: true, result: { platform: "iOS" } });
    await expect(promise).resolves.toMatchObject({ ok: true });
  });

  it("rejects when timeout occurs", async () => {
    host.window!.webkit = {
      messageHandlers: {
        nativeBridge: {
          postMessage: vi.fn()
        }
      }
    };

    const client = new NativeBridgeClient(1000);
    const promise = client.send("getDeviceInfo");

    vi.advanceTimersByTime(1001);
    await expect(promise).rejects.toThrow(/TIMEOUT/);
  });

  it("triggerHaptic sends style payload", async () => {
    let sentRequest: any;
    host.window!.webkit = {
      messageHandlers: {
        nativeBridge: {
          postMessage: (request: any) => {
            sentRequest = request;
            host.window!.onNativeMessage?.({ id: request.id, ok: true, result: { triggered: true } });
          }
        }
      }
    };

    const client = new NativeBridgeClient();
    await client.triggerHaptic("light");

    expect(sentRequest.method).toBe("triggerHaptic");
    expect(sentRequest.payload).toMatchObject({ style: "light" });
  });
});
