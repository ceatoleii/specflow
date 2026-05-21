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
import { assertProjectInstalled } from "../lib/project-guard.js";
import {
  startFlowSession,
  closeActiveSession,
  listSessionsByStatus,
} from "../lib/state/start-session.js";
import {
  writeArtifact,
  appendMessage,
  readContentInput,
  isValidArtifactKind,
  type ArtifactKind,
} from "../lib/state/write-artifact.js";
import { syncCriteriaForSession } from "../lib/state/sync-criteria.js";
import {
  syncTasksFromContent,
  refreshTasksArtifact,
} from "../lib/state/sync-tasks.js";
import { mirrorApprovalFiles, clearCurrentDir } from "../lib/state/mirror-approval.js";

export interface StateOptions {
  cwd?: string;
}

export async function runStateEnsure(options: StateOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  await assertProjectInstalled(targetDir);
  const result = await ensureStateForProject(targetDir);
  console.log("\n✓ State DB ready");
  if (result.migrated) {
    console.log("→ Imported legacy markdown into state.db");
  }
  if (result.activeSessionId) {
    console.log(`  Active session: ${result.activeSessionId}`);
  } else {
    console.log("  Active session: (none)");
  }
}

export async function runStateStartSession(
  options: StateOptions & { title?: string }
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  await assertProjectInstalled(targetDir);
  await ensureStateForProject(targetDir);
  const result = await startFlowSession(targetDir, options.title);
  console.log(`\n✓ Flow session started (${result.sessionId})`);
  console.log(`  Phase: ${result.phase}`);
}

export async function runStateCloseSession(options: StateOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const closed = await closeActiveSession(targetDir);
  if (!closed) {
    console.log("\n→ No active session to close.");
    return;
  }
  await clearCurrentDir(targetDir);
  console.log(`\n✓ Session ${closed.id} archived`);
}

export async function runStateListSessions(
  options: StateOptions & { status?: string }
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const status =
    options.status === "active" || options.status === "archived"
      ? options.status
      : undefined;
  const sessions = listSessionsByStatus(targetDir, status);

  console.log("\nSpecFlow sessions");
  if (!sessions.length) {
    console.log("  (none)");
    return;
  }

  for (const s of sessions) {
    console.log(`  • ${s.id} [${s.status}]${s.title ? ` — ${s.title}` : ""}`);
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
  console.log(`  Active:     ${info.activeCount}`);
  console.log(`  Archived:   ${info.archivedCount}`);

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

export async function runStateWriteArtifact(
  options: StateOptions & {
    kind: string;
    file?: string;
    stdin?: boolean;
  }
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const kind = options.kind.trim();

  if (!isValidArtifactKind(kind)) {
    throw new SpecflowCliError(
      "INVALID_KIND",
      `Invalid artifact kind: ${kind}. Use: task, refinement, sdd, tasks, review`
    );
  }

  const content = await readContentInput(options.file, options.stdin);
  writeArtifact(targetDir, kind as ArtifactKind, content);

  if (kind === "task") {
    syncCriteriaForSession(targetDir, content);
  }

  console.log(`\n✓ Artifact '${kind}' saved to state.db`);
}

export async function runStateAppendMessage(
  options: StateOptions & {
    round: number;
    role: string;
    file?: string;
    stdin?: boolean;
  }
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const role = options.role.trim();

  if (role !== "user" && role !== "agent") {
    throw new SpecflowCliError(
      "INVALID_ROLE",
      "Role must be: user or agent"
    );
  }

  const content = await readContentInput(options.file, options.stdin);
  appendMessage(targetDir, options.round, role, content);
  console.log(`\n✓ Message appended (round ${options.round}, ${role})`);
}

export async function runStateSyncCriteria(options: StateOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const count = syncCriteriaForSession(targetDir);
  console.log(`\n✓ Synced ${count} acceptance criteria from task artifact`);
}

export async function runStateSyncTasks(
  options: StateOptions & { file?: string; stdin?: boolean; noMirror?: boolean }
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const content = await readContentInput(options.file, options.stdin);
  const count = syncTasksFromContent(targetDir, content);

  if (!options.noMirror) {
    const mirrored = await mirrorApprovalFiles(targetDir);
    if (mirrored.length) {
      console.log(`  Mirrored: ${mirrored.join(", ")}`);
    }
  }

  console.log(`\n✓ Synced ${count} tasks to state.db`);
}

export async function runStateMirrorApproval(options: StateOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const written = await mirrorApprovalFiles(targetDir);
  if (!written.length) {
    console.log("\n→ Nothing to mirror (no sdd/tasks in active session).");
    return;
  }
  console.log(`\n✓ Mirrored: ${written.join(", ")}`);
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
  await clearCurrentDir(targetDir);
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

  refreshTasksArtifact(targetDir);
  await mirrorApprovalFiles(targetDir);
  console.log(`\n✓ Task ${options.code} → ${status}`);
}
