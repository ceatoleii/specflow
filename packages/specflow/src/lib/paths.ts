import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Root of the published package (contains assets/, manifest.json). */
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
export const FLOW_FLAG = ".agents-state/.flow-enabled";
