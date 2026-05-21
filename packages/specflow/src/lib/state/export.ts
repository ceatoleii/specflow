import fs from "fs-extra";
import path from "node:path";
import { SpecflowCliError } from "../../errors.js";
import { openDatabase } from "./db.js";
import { getActiveSession, archiveActiveSession } from "./session.js";
import { STATE_DIR } from "../paths.js";

const ARTIFACT_FILES: Record<string, string> = {
  task: "task.md",
  refinement: "refinement-log.md",
  sdd: "sdd.md",
  tasks: "tasks.md",
  review: "review.md",
};

export async function exportSessionToHistory(
  targetDir: string,
  sessionId?: string
): Promise<string> {
  const db = openDatabase(targetDir);

  try {
    const sid =
      sessionId ??
      (() => {
        const active = getActiveSession(db);
        if (!active) return undefined;
        return active.id;
      })();

    if (!sid) {
      throw new SpecflowCliError(
        "NO_SESSION",
        "No active session to export. Run specflow state migrate or start a flow task."
      );
    }

    const historyDir = path.join(targetDir, STATE_DIR, "history", sid);
    await fs.ensureDir(historyDir);

    const artifacts = db
      .prepare("SELECT kind, content FROM artifacts WHERE session_id = ?")
      .all(sid) as Array<{ kind: string; content: string }>;

    for (const a of artifacts) {
      const fileName = ARTIFACT_FILES[a.kind];
      if (fileName) {
        await fs.writeFile(path.join(historyDir, fileName), a.content, "utf8");
      }
    }

    const phase = db
      .prepare(
        `SELECT phase FROM phases WHERE session_id = ? ORDER BY id DESC LIMIT 1`
      )
      .get(sid) as { phase: string } | undefined;

    if (phase?.phase) {
      await fs.writeFile(
        path.join(historyDir, "phase.md"),
        `${phase.phase}\n`,
        "utf8"
      );
    }

    if (!sessionId) {
      archiveActiveSession(db);
    }

    return sid;
  } finally {
    db.close();
  }
}
