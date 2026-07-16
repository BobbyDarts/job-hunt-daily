// /scripts/stop.ts

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const pidFile = resolve(".tmp/jhd-dev.pid");

if (!existsSync(pidFile)) {
  console.log("No running dev server found.");
  process.exit(0);
}

const pid = Number(readFileSync(pidFile, "utf8"));

try {
  if (process.platform === "win32") {
    execSync(`taskkill /PID ${pid} /T /F`, {
      stdio: "ignore",
    });
  } else {
    process.kill(pid);
  }

  console.log(`Stopped process ${pid}`);
} catch {
  console.log(`Process ${pid} was not running.`);
}
