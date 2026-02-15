import { BrowserAgent } from "@newrelic/browser-agent/loaders/browser-agent";

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

function containsPlaceholderToken(value: string): boolean {
  return value.startsWith("__") && value.endsWith("__");
}
