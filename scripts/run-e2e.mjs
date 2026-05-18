import { spawn } from "node:child_process";
import { createServer } from "vite";

const port = 5181;
const headed = process.argv.includes("--headed");
const server = await createServer({
  server: { host: "127.0.0.1", port, strictPort: true },
  optimizeDeps: { force: true },
});

await server.listen();

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const args = ["playwright", "test", "--reporter=list"];
if (headed) args.push("--headed");

const child = spawn(command, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    PLAYWRIGHT_BASE_URL: `http://127.0.0.1:${port}`,
    PLAYWRIGHT_SKIP_WEBSERVER: "1",
  },
});

const exitCode = await new Promise((resolve) => {
  child.on("exit", (code) => resolve(code ?? 1));
});

await server.close();
process.exit(Number(exitCode));
