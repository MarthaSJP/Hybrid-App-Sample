import { spawnSync } from "node:child_process";

const variant = process.env.APP_VARIANT ?? "app-a";
if (variant !== "app-a" && variant !== "app-b") {
  console.error(`[serve-variant] Unsupported APP_VARIANT: ${variant}`);
  process.exit(1);
}

const args = ["serve", "hybrid-web", "--configuration", `development,${variant}`, "--host", "0.0.0.0", "--port", "4200"];
const result = spawnSync("npx", ["ng", ...args], { stdio: "inherit" });
process.exit(result.status ?? 1);
