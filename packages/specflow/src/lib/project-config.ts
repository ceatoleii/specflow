import fs from "fs-extra";
import path from "node:path";
import { CONFIG_FILE } from "./paths.js";
import type { Locale } from "./i18n.js";

export interface ProjectConfig {
  locale: Locale;
  includeDocs: boolean;
  installedAt: string;
  manifestVersion: number;
}

export type ProjectConfigInput = {
  locale: Locale;
  includeDocs: boolean;
  manifestVersion: number;
};

export function normalizeProjectConfig(
  raw: Partial<ProjectConfig> | null
): ProjectConfig | null {
  if (!raw?.locale || raw.installedAt === undefined) return null;
  return {
    locale: raw.locale,
    includeDocs: raw.includeDocs ?? true,
    installedAt: raw.installedAt,
    manifestVersion: raw.manifestVersion ?? 2,
  };
}

export async function readProjectConfig(
  targetDir: string
): Promise<ProjectConfig | null> {
  const filePath = path.join(targetDir, CONFIG_FILE);
  if (!(await fs.pathExists(filePath))) return null;
  const raw = await fs.readJson(filePath);
  return normalizeProjectConfig(raw as Partial<ProjectConfig>);
}

export async function writeProjectConfig(
  targetDir: string,
  input: ProjectConfigInput
): Promise<void> {
  const data: ProjectConfig = {
    locale: input.locale,
    includeDocs: input.includeDocs,
    installedAt: new Date().toISOString(),
    manifestVersion: input.manifestVersion,
  };
  await fs.writeJson(path.join(targetDir, CONFIG_FILE), data, { spaces: 2 });
}
