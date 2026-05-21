import { resolveStateDbPath } from "../paths.js";
import { withStateDb, stateDbExists } from "./db.js";
import { getActiveSession, listSessions } from "./session.js";
import { getCurrentPhaseRow } from "./phase.js";
import { getStateCounts } from "./query.js";

export interface StateStatusInfo {
  dbPath: string;
  hasDb: boolean;
  sessionId?: string;
  phase?: string;
  taskCount: number;
  criteriaCount: number;
  activeCount: number;
  archivedCount: number;
}

export function getStateStatusInfo(targetDir: string): StateStatusInfo {
  const dbPath = resolveStateDbPath(targetDir);
  const hasDb = stateDbExists(targetDir);

  if (!hasDb) {
    return {
      dbPath,
      hasDb,
      taskCount: 0,
      criteriaCount: 0,
      activeCount: 0,
      archivedCount: 0,
    };
  }

  return withStateDb(targetDir, (db) => {
    const activeSessions = listSessions(db, "active");
    const archivedSessions = listSessions(db, "archived");
    const session = getActiveSession(db);

    if (!session) {
      return {
        dbPath,
        hasDb,
        taskCount: 0,
        criteriaCount: 0,
        activeCount: activeSessions.length,
        archivedCount: archivedSessions.length,
      };
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
      activeCount: activeSessions.length,
      archivedCount: archivedSessions.length,
    };
  });
}
