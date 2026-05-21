import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getPackageRoot(): string {
  return path.resolve(__dirname, "..", "..");
}

export function getAssetsDir(): string {
  return path.join(getPackageRoot(), "assets");
}

export function resolveTargetDir(cwd?: string): string {
  return path.resolve(cwd ?? process.cwd());
}

export const VERSION_FILE = ".specflow-version";
export const TOOLS_FILE = ".specflow-tools.json";
export const CONFIG_FILE = ".specflow-config.json";
export const FLOW_FLAG = ".agents-state/.flow-enabled";
