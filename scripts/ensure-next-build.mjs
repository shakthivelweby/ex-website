import { existsSync } from "fs";
import { spawnSync } from "child_process";

if (!existsSync(".next/BUILD_ID")) {
  console.log("No production build found. Running `next build`...");
  const result = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
