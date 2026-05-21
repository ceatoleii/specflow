import fs from "fs-extra";
import path from "node:path";

export async function ensureGitignoreEntries(
  targetDir: string,
  entries: string[]
): Promise<string[]> {
  const gitignorePath = path.join(targetDir, ".gitignore");
  const added: string[] = [];

  let content = "";
  if (await fs.pathExists(gitignorePath)) {
    content = await fs.readFile(gitignorePath, "utf-8");
  }

  const existingLines = new Set(content.split("\n").map((l) => l.trim()));
  const toAdd: string[] = [];

  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed || existingLines.has(trimmed)) continue;
    toAdd.push(trimmed);
    added.push(trimmed);
  }

  if (toAdd.length === 0) return [];

  const block = ["", "# SpecFlow", ...toAdd].join("\n");
  const newContent = content.length
    ? (content.endsWith("\n") ? content : content + "\n") + block + "\n"
    : "# SpecFlow\n" + toAdd.join("\n") + "\n";

  await fs.writeFile(gitignorePath, newContent);
  return added;
}
