import fs from "fs-extra";
import path from "node:path";
import { SpecflowCliError } from "../../errors.js";
import { withStateDbAsync } from "./db.js";
import { getActiveSession, archiveActiveSession } from "./session.js";
import { STATE_DIR } from "../paths.js";
import { artifactFileForKind } from "./artifacts.js";

export async function exportSessionToHistory(
  targetDir: string,
  sessionId?: string
): Promise<string> {
  return withStateDbAsync(targetDir, async (db) => {
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
      const fileName = artifactFileForKind(a.kind);
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
  });
}
