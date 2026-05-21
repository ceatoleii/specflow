import { SpecflowCliError } from "../errors.js";
import { resolveTargetDir } from "../lib/paths.js";
import { openDatabase, stateDbExists } from "../lib/state/db.js";
import { getStateStatusInfo } from "../lib/state/status-info.js";
import { migrateLegacyState } from "../lib/state/migrate.js";
import { querySlice, syncTaskStatus, type QuerySlice } from "../lib/state/query.js";
import { searchState } from "../lib/state/fts.js";
import { exportSessionToHistory } from "../lib/state/export.js";
import { setPhase, isValidPhase } from "../lib/state/phase.js";
import { ensureStateForProject } from "../lib/state/ensure.js";
import { isStateDbEnabled } from "../lib/project-config.js";

export interface StateOptions {
  cwd?: string;
}

export async function runStateEnsure(options: StateOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const enabled = await isStateDbEnabled(targetDir);
  if (!enabled) {
    throw new SpecflowCliError(
      "STATE_DB_DISABLED",
      "state.db is disabled in .specflow-config.json. Re-run specflow init or set stateDb: true."
    );
  }
  const result = await ensureStateForProject(targetDir);
  console.log(`\n✓ State DB ready (session ${result.sessionId})`);
  if (result.migrated) {
    console.log("→ Imported legacy markdown into state.db");
  }
}

export async function runStateStatus(options: StateOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);

  if (!stateDbExists(targetDir)) {
    openDatabase(targetDir).close();
  }

  const info = getStateStatusInfo(targetDir);

  console.log("\nSpecFlow state");
  console.log(`  Database:   ${info.dbPath}`);
  if (!info.sessionId) {
    console.log("  Session:    (none)");
    return;
  }
  console.log(`  Session:    ${info.sessionId}`);
  console.log(`  Phase:      ${info.phase ?? "(unset)"}`);
  console.log(`  Tasks:      ${info.taskCount}`);
  console.log(`  Criteria:   ${info.criteriaCount}`);
}

export async function runStateQuery(
  options: StateOptions & { slice: string; json?: boolean }
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const slice = options.slice as QuerySlice;
  const valid: QuerySlice[] = [
    "phase",
    "task",
    "active-task",
    "criteria",
    "decisions",
    "sdd-summary",
  ];

  if (!valid.includes(slice)) {
    throw new SpecflowCliError(
      "INVALID_SLICE",
      `Invalid slice: ${options.slice}. Use: ${valid.join(", ")}`
    );
  }

  const result = querySlice(targetDir, slice);
  if (result === null) {
    console.log("");
    return;
  }

  if (options.json) {
    console.log(JSON.stringify({ slice, content: result }));
  } else {
    console.log(result);
  }
}

export async function runStateSearch(
  options: StateOptions & { term: string }
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  if (!options.term.trim()) {
    throw new SpecflowCliError("INVALID_TERM", "Search term is required.");
  }

  const hits = searchState(targetDir, options.term.trim());
  if (!hits.length) {
    console.log("No matches.");
    return;
  }

  for (const h of hits) {
    console.log(`[${h.source}#${h.id}] ${h.snippet}`);
  }
}

export async function runStateMigrate(options: StateOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const result = await migrateLegacyState(targetDir);
  if (result.migrated) {
    console.log(`\n✓ Migrated legacy markdown → state.db (session ${result.sessionId})`);
  } else {
    console.log("\n→ Already migrated or nothing to import.");
  }
}

export async function runStateExport(options: StateOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const archiveId = await exportSessionToHistory(targetDir);
  console.log(`\n✓ Exported session to .agents-state/history/${archiveId}/`);
}

export async function runStateSetPhase(
  options: StateOptions & { phase: string }
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const phase = options.phase.trim();

  if (!isValidPhase(phase)) {
    throw new SpecflowCliError(
      "INVALID_PHASE",
      `Invalid phase: ${phase}. Use: refining, designing, implementing, reviewing`
    );
  }

  await setPhase(targetDir, phase);
  console.log(`\n✓ Phase set to ${phase}`);
}

export async function runStateSyncTask(
  options: StateOptions & { code: string; status: string }
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const status = options.status as "pending" | "in_progress" | "done";

  if (!["pending", "in_progress", "done"].includes(status)) {
    throw new SpecflowCliError(
      "INVALID_STATUS",
      "Status must be: pending, in_progress, done"
    );
  }

  const ok = syncTaskStatus(targetDir, options.code, status);
  if (!ok) {
    throw new SpecflowCliError(
      "TASK_NOT_FOUND",
      `Task ${options.code} not found in active session.`
    );
  }
  console.log(`\n✓ Task ${options.code} → ${status}`);
}
