import { spawnSync } from "node:child_process";

const variant = process.env.APP_VARIANT ?? "app-a";
if (variant !== "app-a" && variant !== "app-b") {
  console.error(`[build-variant] Unsupported APP_VARIANT: ${variant}`);
  process.exit(1);
}

const args = ["build", "hybrid-web", "--configuration", `production,${variant}`];
const result = spawnSync("npx", ["ng", ...args], { stdio: "inherit" });
process.exit(result.status ?? 1);
