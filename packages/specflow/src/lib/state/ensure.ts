import { isStateDbEnabled } from "../project-config.js";
import { openDatabase, setMeta } from "./db.js";
import { maybeMigrateLegacyState } from "./maybe-migrate.js";
import { createActiveSession } from "./session.js";

export interface EnsureStateResult {
  enabled: boolean;
  bootstrapped: boolean;
  migrated: boolean;
  sessionId?: string;
}

/** Bootstrap state.db when project config has stateDb: true. */
export async function ensureStateForProject(
  targetDir: string
): Promise<EnsureStateResult> {
  const enabled = await isStateDbEnabled(targetDir);
  if (!enabled) {
    return { enabled: false, bootstrapped: false, migrated: false };
  }

  const db = openDatabase(targetDir);
  let sessionId: string;
  try {
    const session = createActiveSession(db);
    sessionId = session.id;
    setMeta(db, "state_db_enabled", "1");
  } finally {
    db.close();
  }

  const migrated = await maybeMigrateLegacyState(targetDir);

  return {
    enabled: true,
    bootstrapped: true,
    migrated: migrated.ran,
    sessionId: migrated.sessionId ?? sessionId,
  };
}
