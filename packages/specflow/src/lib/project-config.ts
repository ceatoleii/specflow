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

export async function readProjectConfig(
  targetDir: string
): Promise<ProjectConfig | null> {
  const filePath = path.join(targetDir, CONFIG_FILE);
  if (!(await fs.pathExists(filePath))) return null;
  return fs.readJson(filePath) as Promise<ProjectConfig>;
}

export async function writeProjectConfig(
  targetDir: string,
  locale: Locale,
  includeDocs: boolean,
  manifestVersion: number
): Promise<void> {
  const data: ProjectConfig = {
    locale,
    includeDocs,
    installedAt: new Date().toISOString(),
    manifestVersion,
  };
  await fs.writeJson(path.join(targetDir, CONFIG_FILE), data, { spaces: 2 });
}
