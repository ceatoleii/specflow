import fs from "fs-extra";
import path from "node:path";
import { TOOLS_FILE } from "./paths.js";

export interface ProjectToolsConfig {
  tools: string[];
  installedAt: string;
  manifestVersion: number;
}

export async function readProjectTools(
  targetDir: string
): Promise<ProjectToolsConfig | null> {
  const filePath = path.join(targetDir, TOOLS_FILE);
  if (!(await fs.pathExists(filePath))) return null;
  return fs.readJson(filePath) as Promise<ProjectToolsConfig>;
}

export async function writeProjectTools(
  targetDir: string,
  tools: string[],
  manifestVersion: number
): Promise<void> {
  const data: ProjectToolsConfig = {
    tools: [...new Set(tools)].sort(),
    installedAt: new Date().toISOString(),
    manifestVersion,
  };
  await fs.writeJson(path.join(targetDir, TOOLS_FILE), data, { spaces: 2 });
}

export async function detectLegacyTools(targetDir: string): Promise<string[]> {
  const tools: string[] = [];
  if (
    await fs.pathExists(
      path.join(targetDir, ".cursor/rules/_specflow.mdc")
    )
  ) {
    tools.push("cursor");
  }
  if (await fs.pathExists(path.join(targetDir, "CLAUDE.md"))) {
    const content = await fs.readFile(
      path.join(targetDir, "CLAUDE.md"),
      "utf-8"
    );
    if (content.includes("SpecFlow")) tools.push("claude-code");
  }
  if (
    await fs.pathExists(
      path.join(targetDir, ".github/copilot-instructions.md")
    )
  ) {
    tools.push("github-copilot");
  }
  return tools;
}
