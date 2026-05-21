import { isFlowActive } from "../flow.js";
import { isStateDbEnabled } from "../project-config.js";
import { stateDbExists, getMeta, openDatabase } from "./db.js";
import { hasLegacyMarkdown, migrateLegacyState } from "./migrate.js";

export async function maybeMigrateLegacyState(
  targetDir: string
): Promise<{ ran: boolean; sessionId?: string }> {
  if (!(await isStateDbEnabled(targetDir))) {
    return { ran: false };
  }

  if (await isFlowActive(targetDir)) {
    return { ran: false };
  }

  if (stateDbExists(targetDir)) {
    const db = openDatabase(targetDir);
    try {
      if (getMeta(db, "migrated_from_legacy") === "1") {
        return { ran: false };
      }
    } finally {
      db.close();
    }
  }

  if (!(await hasLegacyMarkdown(targetDir))) {
    return { ran: false };
  }

  const result = await migrateLegacyState(targetDir);
  return { ran: result.migrated, sessionId: result.sessionId };
}
