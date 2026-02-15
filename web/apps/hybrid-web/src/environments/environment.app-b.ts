import type { MonitoringConfig } from "../monitoring/monitoring-init";

export const environment: { monitoring: MonitoringConfig } = {
  monitoring: {
    enabled: true,
    init: {
      session_trace: { enabled: true },
      session_replay: {
        enabled: true,
        mask_text_selector: "*",
        mask_all_inputs: true,
        collect_fonts: true,
        inline_images: false,
        inline_stylesheet: true,
        fix_stylesheets: true,
        preload: true,
        mask_input_options: {}
      },
      distributed_tracing: { enabled: true },
      performance: { capture_measures: true },
      privacy: { cookies_enabled: true },
      ajax: { deny_list: ["bam.nr-data.net"] }
    },
    info: {
      beacon: "bam.nr-data.net",
      errorBeacon: "bam.nr-data.net",
      licenseKey: "__NR_APP_B_LICENSE_KEY__",
      applicationID: "__NR_APP_B_APPLICATION_ID__",
      sa: 1
    },
    loaderConfig: {
      accountID: "__NR_APP_B_ACCOUNT_ID__",
      trustKey: "__NR_APP_B_TRUST_KEY__",
      agentID: "__NR_APP_B_AGENT_ID__",
      licenseKey: "__NR_APP_B_LICENSE_KEY__",
      applicationID: "__NR_APP_B_APPLICATION_ID__"
    }
  }
};
