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
export const LINEAR_CONFIG_FILE = ".specflow-linear.json";
export const LINEAR_STATE_FILE = ".agents-state/current/linear.json";
export const STATE_DIR = ".agents-state";
export const STATE_CURRENT = ".agents-state/current";
export const FLOW_FLAG = ".agents-state/.flow-enabled";
export const FLOW_PHASE_FILE = ".agents-state/current/phase.md";

export function resolveStateCurrentPath(targetDir: string): string {
  return path.join(targetDir, STATE_CURRENT);
}

export function resolveFlowPhasePath(targetDir: string): string {
  return path.join(targetDir, FLOW_PHASE_FILE);
}
