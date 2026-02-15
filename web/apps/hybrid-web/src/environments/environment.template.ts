import type { MonitoringConfig } from "../monitoring/monitoring-init";

export const environment: { monitoring: MonitoringConfig } = {
  monitoring: {
    enabled: true,
    init: {
      session_trace: { enabled: true },
      session_replay: {
        enabled: true,
        block_selector: "",
        mask_text_selector: "*",
        sampling_rate: 100.0,
        error_sampling_rate: 100.0,
        mask_all_inputs: true,
        collect_fonts: true,
        inline_images: false,
        inline_stylesheet: true,
        fix_stylesheets: true,
        preload: false,
        mask_input_options: {}
      },
      distributed_tracing: { enabled: true },
      performance: { capture_measures: true },
      browser_consent_mode: { enabled: false },
      privacy: { cookies_enabled: true },
      ajax: { deny_list: ["bam.nr-data.net"] }
    },
    info: {
      beacon: "bam.nr-data.net",
      errorBeacon: "bam.nr-data.net",
      licenseKey: "__NRJS_LICENSE_KEY__",
      applicationID: "__NR_APPLICATION_ID__",
      sa: 1
    },
    loaderConfig: {
      accountID: "__NR_ACCOUNT_ID__",
      trustKey: "__NR_TRUST_KEY__",
      agentID: "__NR_AGENT_ID__",
      licenseKey: "__NRJS_LICENSE_KEY__",
      applicationID: "__NR_APPLICATION_ID__"
    }
  }
};
