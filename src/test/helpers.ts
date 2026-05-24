import fs from "fs-extra";
import path from "node:path";
import { execa } from "execa";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PKG_ROOT = path.resolve(__dirname, "..", "..");
export const CLI_PATH = path.join(PKG_ROOT, "dist", "cli.js");
export const TMP_ROOT = path.join(PKG_ROOT, ".test-tmp");

let runId = 0;
const activeProjects: string[] = [];

export async function createProjectDir(name: string): Promise<string> {
  const dir = path.join(TMP_ROOT, `${name}-${++runId}`);
  await fs.ensureDir(dir);
  activeProjects.push(dir);
  return dir;
}

export async function drainActiveProjects(): Promise<void> {
  while (activeProjects.length > 0) {
    const dir = activeProjects.pop();
    if (dir) await fs.remove(dir).catch(() => {});
  }
}

export async function cleanupTmp(): Promise<void> {
  await fs.remove(TMP_ROOT).catch(() => {});
}

export async function runCli(
  args: string[],
  options: { cwd?: string; reject?: boolean } = {}
) {
  return execa("node", [CLI_PATH, ...args], {
    cwd: options.cwd ?? PKG_ROOT,
    reject: options.reject ?? false,
    env: { ...process.env, NODE_ENV: "test" },
  });
}
