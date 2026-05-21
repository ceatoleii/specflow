import { resolveStateDbPath } from "../paths.js";
import { openDatabase, stateDbExists } from "./db.js";
import { getActiveSession } from "./session.js";
import { getCurrentPhaseRow } from "./phase.js";
import { getStateCounts } from "./query.js";

export interface StateStatusInfo {
  dbPath: string;
  hasDb: boolean;
  sessionId?: string;
  phase?: string;
  taskCount: number;
  criteriaCount: number;
}

export function getStateStatusInfo(targetDir: string): StateStatusInfo {
  const dbPath = resolveStateDbPath(targetDir);
  const hasDb = stateDbExists(targetDir);

  if (!hasDb) {
    return { dbPath, hasDb, taskCount: 0, criteriaCount: 0 };
  }

  const db = openDatabase(targetDir);
  try {
    const session = getActiveSession(db);
    if (!session) {
      return { dbPath, hasDb, taskCount: 0, criteriaCount: 0 };
    }

    const phaseRow = getCurrentPhaseRow(db, session.id);
    const counts = getStateCounts(db, session.id);

    return {
      dbPath,
      hasDb,
      sessionId: session.id,
      phase: phaseRow?.phase,
      taskCount: counts.tasks,
      criteriaCount: counts.criteria,
    };
  } finally {
    db.close();
  }
}
