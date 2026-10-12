import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
const state = await mkdtemp(join(tmpdir(), "bildr-interview-test-"));
const port = await new Promise((resolve) => {
  const s = createServer();
  s.listen(0, "127.0.0.1", () => {
    const p = s.address().port;
    s.close(() => resolve(p));
  });
});
let server;
let log = "";
try {
  for (const args of [
    ["d1", "migrations", "apply", "DB", "--local", "--persist-to", state],
    [
      "d1",
      "execute",
      "DB",
      "--local",
      "--persist-to",
      state,
      "--file",
      "scripts/seed.sql",
    ],
  ]) {
    const result = spawnSync(
      process.execPath,
      ["node_modules/wrangler/bin/wrangler.js", ...args],
      { encoding: "utf8", env: { ...process.env, CI: "true" } },
    );
    if (result.status !== 0) throw new Error(result.stderr + result.stdout);
  }
  server = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      env: { ...process.env, INTERVIEW_STATE_DIR: state },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (d) => (log += d));
  server.stderr.on("data", (d) => (log += d));
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const response = await fetch(`${base}/api/users/me`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!ready) throw new Error(`Test server did not start. ${log}`);
  const status = await new Promise((resolve) => {
    const child = spawn(process.execPath, ["--test", "tests/api.test.mjs"], {
      env: { ...process.env, TEST_BASE_URL: base },
      stdio: "inherit",
    });
    child.on("exit", resolve);
  });
  process.exitCode = status ?? 1;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (server) {
    const stopped = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM");
    await stopped;
  }
  await rm(state, { recursive: true, force: true });
}
