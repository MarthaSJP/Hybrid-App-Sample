import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";
import { environment } from "./environments/environment";
import { initMonitoring, setMonitoringCustomAttribute } from "./monitoring/monitoring-init";
import { NativeBridgeClient } from "@internal/native-bridge-sdk";

// Angular起動前にBrowser Agentを初期化し、初期描画イベントの取りこぼしを減らす。
initMonitoring(environment.monitoring);
if (isNativeBridgeAvailable()) {
  // WebView実行時のみ、Mobile Agentの文脈情報をBrowser Agentへ連携する。
  void attachMobileAgentContext();
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

async function attachMobileAgentContext(): Promise<void> {
  const bridge = new NativeBridgeClient();

  try {
    const context = await bridge.getMobileAgentContext();
    // mobileSessionId をキーにして Mobile / Browser イベントを横断分析する。
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
