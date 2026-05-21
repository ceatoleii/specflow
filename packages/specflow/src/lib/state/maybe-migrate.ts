import { isFlowActive } from "../flow.js";
import { isStateDbEnabled } from "../project-config.js";
import { stateDbExists, getMeta, withStateDb } from "./db.js";
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
    const alreadyMigrated = withStateDb(targetDir, (db) => {
      return getMeta(db, "migrated_from_legacy") === "1";
    });
    if (alreadyMigrated) {
      return { ran: false };
    }
  }

  if (!(await hasLegacyMarkdown(targetDir))) {
    return { ran: false };
  }

  const result = await migrateLegacyState(targetDir);
  return { ran: result.migrated, sessionId: result.sessionId };
}
