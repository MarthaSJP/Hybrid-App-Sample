import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";
import { environment } from "./environments/environment";
import { initMonitoring, setMonitoringCustomAttribute } from "./monitoring/monitoring-init";
import { NativeBridgeClient } from "@internal/native-bridge-sdk";

initMonitoring(environment.monitoring);
if (isNativeBridgeAvailable()) {
  void attachMobileAgentContext();
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

async function attachMobileAgentContext(): Promise<void> {
  const bridge = new NativeBridgeClient();

  try {
    const context = await bridge.getMobileAgentContext();
    setMonitoringCustomAttribute("mobileSessionId", context.sessionId || null, true);
    setMonitoringCustomAttribute("mobileUuid", context.uuid || null, true);
  } catch (error) {
    console.warn("[monitoring] Failed to attach mobile agent context", error);
  }
}

function isNativeBridgeAvailable(): boolean {
  const host = globalThis as typeof globalThis & { webkit?: { messageHandlers?: Record<string, unknown> } };
  const handler = host.webkit?.messageHandlers?.["nativeBridge"] as { postMessage?: unknown } | undefined;
  return Boolean(handler && typeof handler.postMessage === "function");
}
