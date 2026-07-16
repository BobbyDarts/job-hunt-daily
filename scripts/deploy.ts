// /scripts/deploy.ts

import { execSync, spawn } from "node:child_process";
import { copyFile } from "node:fs/promises";

const NGINX = "C:/nginx";

async function main() {
  console.log("Stopping dev server...");
  execSync("npm run stop", { stdio: "inherit" });

  console.log("Building production...");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";

  execSync(`${npm} run build`, { stdio: "inherit" });

  console.log("Enabling nginx production config...");

  await copyFile(
    `${NGINX}/conf/sites-available/jhd.prod.conf`,
    `${NGINX}/conf/sites-enabled/jhd.conf`,
  );

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
}

await main();
