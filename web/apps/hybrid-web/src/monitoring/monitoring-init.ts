import { BrowserAgent } from "@newrelic/browser-agent/loaders/browser-agent";

type NewRelicApi = {
  setCustomAttribute?: (name: string, value: string | number | boolean | null, persist?: boolean) => void;
};

declare global {
  interface Window {
    newrelic?: NewRelicApi;
  }
}

export type MonitoringInfoConfig = {
  beacon?: string;
  errorBeacon?: string;
  licenseKey: string;
  applicationID: string;
  sa?: number;
};

export type MonitoringConfig = {
  enabled: boolean;
  init?: Record<string, unknown>;
  info: MonitoringInfoConfig;
  loaderConfig?: Record<string, unknown>;
  exposed?: boolean;
};

export function initMonitoring(config: MonitoringConfig): void {
  if (!config.enabled) {
    return;
  }

  // Browser Agent初期化に必要な最低限の値をチェックする。
  const hasRequiredValues = Boolean(config.info?.applicationID && config.info?.licenseKey);
  if (!hasRequiredValues) {
    console.warn("[monitoring] Missing required New Relic config. Monitoring disabled.");
    return;
  }
  if (containsPlaceholderToken(config.info.applicationID) || containsPlaceholderToken(config.info.licenseKey)) {
    console.warn("[monitoring] Placeholder token is not replaced. Monitoring disabled.");
    return;
  }

  try {
    new BrowserAgent({
      init: config.init,
      info: config.info,
      loader_config: config.loaderConfig,
      exposed: config.exposed ?? true
    });
  } catch (error) {
    console.error("[monitoring] New Relic initialization failed", error);
    return;
  }
}

export function setMonitoringCustomAttribute(
  key: string,
  value: string | number | boolean | null,
  persist = false
): void {
  if (!key) {
    return;
  }
  // persist=true の場合、同一セッション内の後続イベントにも属性を引き継ぐ。
  window.newrelic?.setCustomAttribute?.(key, value, persist);
}

function containsPlaceholderToken(value: string): boolean {
  return value.startsWith("__") && value.endsWith("__");
}
