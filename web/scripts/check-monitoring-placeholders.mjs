import { readFileSync } from "node:fs";

const targets = [
  "apps/hybrid-web/src/environments/environment.app-a.ts",
  "apps/hybrid-web/src/environments/environment.app-b.ts"
];

const requiredTokens = {
  "apps/hybrid-web/src/environments/environment.app-a.ts": [
    "__NR_APP_A_LICENSE_KEY__",
    "__NR_APP_A_APPLICATION_ID__",
    "__NR_APP_A_ACCOUNT_ID__",
    "__NR_APP_A_TRUST_KEY__",
    "__NR_APP_A_AGENT_ID__"
  ],
  "apps/hybrid-web/src/environments/environment.app-b.ts": [
    "__NR_APP_B_LICENSE_KEY__",
    "__NR_APP_B_APPLICATION_ID__",
    "__NR_APP_B_ACCOUNT_ID__",
    "__NR_APP_B_TRUST_KEY__",
    "__NR_APP_B_AGENT_ID__"
  ]
};

let hasError = false;

for (const filePath of targets) {
  const body = readFileSync(new URL(`../${filePath}`, import.meta.url), "utf8");
  for (const token of requiredTokens[filePath]) {
    if (!body.includes(token)) {
      console.error(`[check-monitoring-placeholders] Missing placeholder "${token}" in ${filePath}`);
      hasError = true;
    }
  }
}

if (hasError) {
  console.error("[check-monitoring-placeholders] Refusing build: environment files must keep placeholder values in git.");
  process.exit(1);
}

console.log("[check-monitoring-placeholders] OK");
