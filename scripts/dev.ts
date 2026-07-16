// /scripts/dev.ts

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const NGINX = "C:/nginx";
const ENABLED = `${NGINX}/conf/sites-enabled/jhd.conf`;
const DEV_CONFIG = `${NGINX}/conf/sites-available/jhd.dev.conf`;
const PID_FILE = resolve(".tmp/jhd-dev.pid");

async function main() {
  if (existsSync(PID_FILE)) {
    const pid = readFileSync(PID_FILE, "utf8");

    console.log(`Dev server appears to already be running (PID ${pid}).`);
    console.log("Run `npm run stop` before starting again.");

    process.exit(1);
  }

  console.log("Enabling nginx development config...");

  await copyFile(DEV_CONFIG, ENABLED);

  console.log("Reloading nginx...");

  await new Promise<void>((resolve, reject) => {
    const nginx = spawn(
      `${NGINX}/nginx.exe`,
      ["-p", `${NGINX}/`, "-s", "reload"],
      {
        cwd: NGINX,
        stdio: "inherit",
      },
    );

    nginx.on("exit", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`nginx reload failed: ${code}`));
      }
    });
  });

  console.log("Starting Vite...");

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";

  const vite = spawn(npm, ["run", "dev"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (!vite.pid) {
    throw new Error("Failed to start Vite.");
  }

  await mkdir(resolve(".tmp"), { recursive: true });
  await writeFile(PID_FILE, String(vite.pid));

  console.log(`Vite PID: ${vite.pid}`);

  const cleanup = async () => {
    vite.kill("SIGINT");
    await unlink(PID_FILE).catch(() => {});
  };

  process.on("SIGINT", async () => {
    console.log("\nStopping Vite...");
    await cleanup();
    process.exit(0);
  });

  vite.on("exit", async code => {
    await unlink(PID_FILE).catch(() => {});
    process.exit(code ?? 0);
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
