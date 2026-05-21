import fs from "fs-extra";
import path from "node:path";
import { withStateDb } from "./db.js";
import { getActiveSession } from "./session.js";
import { resolveStateCurrentPath } from "../paths.js";
import { artifactFileForKind } from "./artifacts.js";
import { renderTasksMarkdown } from "./sync-tasks.js";

export const HUMAN_APPROVAL_FILES = ["sdd.md", "tasks.md"] as const;

export async function clearNonApprovalFiles(targetDir: string): Promise<void> {
  const currentDir = resolveStateCurrentPath(targetDir);
  if (!(await fs.pathExists(currentDir))) return;

  const entries = await fs.readdir(currentDir);
  for (const entry of entries) {
    if (!(HUMAN_APPROVAL_FILES as readonly string[]).includes(entry)) {
      await fs.remove(path.join(currentDir, entry));
    }
  }
}

export async function mirrorApprovalFiles(targetDir: string): Promise<string[]> {
  const currentDir = resolveStateCurrentPath(targetDir);
  await fs.ensureDir(currentDir);

  const payload = withStateDb(targetDir, (db) => {
    const session = getActiveSession(db);
    if (!session) return null;

    const sddRow = db
      .prepare(
        "SELECT content FROM artifacts WHERE session_id = ? AND kind = 'sdd' LIMIT 1"
      )
      .get(session.id) as { content: string } | undefined;

    const tasksMarkdown = renderTasksMarkdown(db, session.id);
    const hasTasks = tasksMarkdown.trim() !== "# Tasks";

    return {
      sdd: sddRow?.content,
      tasks: hasTasks ? tasksMarkdown : undefined,
    };
  });

  if (!payload) return [];

  const written: string[] = [];

  if (payload.sdd) {
    const fileName = artifactFileForKind("sdd")!;
    await fs.writeFile(path.join(currentDir, fileName), payload.sdd, "utf8");
    written.push(fileName);
  }

  if (payload.tasks) {
    await fs.writeFile(path.join(currentDir, "tasks.md"), payload.tasks, "utf8");
    written.push("tasks.md");
  }

  await clearNonApprovalFiles(targetDir);
  return written;
}

export async function clearCurrentDir(targetDir: string): Promise<void> {
  const currentDir = resolveStateCurrentPath(targetDir);
  if (await fs.pathExists(currentDir)) {
    await fs.emptyDir(currentDir);
  }
}
