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
      licenseKey: "fa588da833db29ebeee",
      applicationID: "1431907645",
      sa: 1
    },
    loaderConfig: {
      accountID: "7467237",
      trustKey: "6729598",
      agentID: "1431907645",
      licenseKey: "fa588da833db29ebeee",
      applicationID: "1431907645"
    }
  }
};
