import fs from "fs-extra";
import path from "node:path";
import { LINEAR_CONFIG_FILE } from "./paths.js";

export interface LinearStateMapping {
  onRefiningComplete: string;
  onApprove: string;
  onReviewPass: string;
  onReviewFail: string;
}

export interface LinearConfig {
  enabled: boolean;
  team?: string;
  states: LinearStateMapping;
}

export const DEFAULT_LINEAR_STATES: LinearStateMapping = {
  onRefiningComplete: "Todo",
  onApprove: "In Progress",
  onReviewPass: "Done",
  onReviewFail: "In Progress",
};

export function normalizeLinearConfig(
  raw: Partial<LinearConfig> | null
): LinearConfig | null {
  if (!raw || typeof raw.enabled !== "boolean") return null;
  return {
    enabled: raw.enabled,
    team: raw.team,
    states: {
      onRefiningComplete:
        raw.states?.onRefiningComplete ?? DEFAULT_LINEAR_STATES.onRefiningComplete,
      onApprove: raw.states?.onApprove ?? DEFAULT_LINEAR_STATES.onApprove,
      onReviewPass: raw.states?.onReviewPass ?? DEFAULT_LINEAR_STATES.onReviewPass,
      onReviewFail: raw.states?.onReviewFail ?? DEFAULT_LINEAR_STATES.onReviewFail,
    },
  };
}

export function defaultLinearConfig(enabled: boolean): LinearConfig {
  return {
    enabled,
    states: { ...DEFAULT_LINEAR_STATES },
  };
}

export async function readLinearConfig(
  targetDir: string
): Promise<LinearConfig | null> {
  const filePath = path.join(targetDir, LINEAR_CONFIG_FILE);
  if (!(await fs.pathExists(filePath))) return null;
  const raw = await fs.readJson(filePath);
  return normalizeLinearConfig(raw as Partial<LinearConfig>);
}

export async function writeLinearConfig(
  targetDir: string,
  config: LinearConfig
): Promise<void> {
  await fs.writeJson(
    path.join(targetDir, LINEAR_CONFIG_FILE),
    config,
    { spaces: 2 }
  );
}
