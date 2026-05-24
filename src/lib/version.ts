import fs from "fs-extra";
import path from "node:path";
import { createRequire } from "node:module";
import { VERSION_FILE } from "./paths.js";

const require = createRequire(import.meta.url);

export interface ProjectVersion {
  specflow: string;
  installedAt: string;
  manifestVersion: number;
}

export function getCliVersion(): string {
  const pkg = require("../../package.json") as { version: string };
  return pkg.version;
}

export async function readProjectVersion(
  targetDir: string
): Promise<ProjectVersion | null> {
  const filePath = path.join(targetDir, VERSION_FILE);
  if (!(await fs.pathExists(filePath))) return null;
  return fs.readJson(filePath) as Promise<ProjectVersion>;
}

export async function writeProjectVersion(
  targetDir: string,
  version: string,
  manifestVersion: number
): Promise<void> {
  const data: ProjectVersion = {
    specflow: version,
    installedAt: new Date().toISOString(),
    manifestVersion,
  };
  await fs.writeJson(path.join(targetDir, VERSION_FILE), data, { spaces: 2 });
}
