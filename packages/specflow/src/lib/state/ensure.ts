import fs from "fs-extra";
import path from "node:path";
import type { StateDatabase } from "./db.js";
import { withStateDb, setMeta } from "./db.js";
import { maybeMigrateLegacyState } from "./maybe-migrate.js";
import { getActiveSession } from "./session.js";

export interface EnsureStateResult {
  bootstrapped: boolean;
  migrated: boolean;
  activeSessionId?: string;
}

/** Bootstrap state.db schema (no new session). */
export async function ensureStateForProject(
  targetDir: string
): Promise<EnsureStateResult> {
  withStateDb(targetDir, (db) => {
    setMeta(db, "state_db_enabled", "1");
  });

  const migrated = await maybeMigrateLegacyState(targetDir);

  const activeSessionId = withStateDb(targetDir, (db) => {
    return getActiveSession(db)?.id;
  });

  return {
    bootstrapped: true,
    migrated: migrated.ran,
    activeSessionId,
  };
}
