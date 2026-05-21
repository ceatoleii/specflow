import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import {
  runStateStatus,
  runStateMigrate,
  runStateSetPhase,
  runStateQuery,
  runStateExport,
  runStateStartSession,
  runStateWriteArtifact,
  runStateMirrorApproval,
  runStateCloseSession,
  runStateListSessions,
} from "./state.js";
import { runSync } from "./sync.js";
import { runStatus } from "./status.js";
import { createProjectDir } from "../test/helpers.js";
import { installTestProject } from "../test/install-fixture.js";
import { writeProjectVersion } from "../lib/version.js";
import { insertDecision } from "../lib/state/fts.js";
import { openDatabase } from "../lib/state/db.js";
import { ensureActiveSession } from "../lib/state/session.js";
import { syncTaskStatus } from "../lib/state/query.js";
import { STATE_DB, FLOW_FLAG } from "../lib/paths.js";

describe("state engine", () => {
  it("S01 — fresh status creates state.db", async () => {
    const dir = await createProjectDir("state-fresh");
    await installTestProject(dir, { includeDocs: false, tools: [] });

    await expect(runStateStatus({ cwd: dir })).resolves.toBeUndefined();
    expect(await fs.pathExists(path.join(dir, STATE_DB))).toBe(true);
  });

  it("S02 — migrate legacy markdown", async () => {
    const dir = await createProjectDir("state-migrate");
    const current = path.join(dir, ".agents-state", "current");
    await fs.ensureDir(current);
    await fs.writeFile(path.join(current, "phase.md"), "designing\n");
    await fs.writeFile(
      path.join(current, "task.md"),
      "# Task: Test\n\n## Acceptance Criteria\n- [ ] AC one\n"
    );

    await runStateMigrate({ cwd: dir });

    const db = openDatabase(dir);
    try {
      const session = ensureActiveSession(db);
      expect(session.id).toBeTruthy();
      const phase = db
        .prepare(
          `SELECT phase FROM phases WHERE session_id = ? ORDER BY id DESC LIMIT 1`
        )
        .get(session.id) as { phase: string };
      expect(phase.phase).toBe("designing");
    } finally {
      db.close();
    }
  });

  it("S03 — one-shot skipped when flow active", async () => {
    const dir = await createProjectDir("state-skip-flow");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    const current = path.join(dir, ".agents-state", "current");
    await fs.ensureDir(current);
    await fs.writeFile(path.join(current, "task.md"), "# Task\n");
    await fs.writeFile(path.join(dir, FLOW_FLAG), "");

    await writeProjectVersion(dir, "1.2.0", 2);
    await runSync({ cwd: dir, yes: true });

    const db = openDatabase(dir);
    try {
      const session = db
        .prepare("SELECT id FROM sessions LIMIT 1")
        .get() as { id: string } | undefined;
      expect(session).toBeUndefined();
    } finally {
      db.close();
    }
  });

  it("S04 — one-shot on sync without flow flag", async () => {
    const dir = await createProjectDir("state-sync-migrate");
    await installTestProject(dir, {
      includeDocs: false,
      tools: [],
      stateDb: true,
    });
    const current = path.join(dir, ".agents-state", "current");
    await fs.ensureDir(current);
    await fs.writeFile(path.join(current, "phase.md"), "refining\n");

    await writeProjectVersion(dir, "1.2.0", 2);
    await runSync({ cwd: dir, yes: true });

    expect(await fs.pathExists(path.join(dir, STATE_DB))).toBe(true);
  });

  it("S05 — set-phase updates phase in DB", async () => {
    const dir = await createProjectDir("state-set-phase");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    await runStateStartSession({ cwd: dir });

    await runStateSetPhase({ cwd: dir, phase: "implementing" });

    const phase = await import("../lib/state/query.js").then((m) =>
      m.querySlice(dir, "phase")
    );
    expect(phase).toBe("implementing");
    expect(
      await fs.pathExists(path.join(dir, ".agents-state", "current", "phase.md"))
    ).toBe(false);
  });

  it("S06 — query active-task returns first pending", async () => {
    const dir = await createProjectDir("state-active-task");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    const db = openDatabase(dir);
    const session = ensureActiveSession(db);
    db.prepare(
      `INSERT INTO tasks (session_id, code, title, body, status, sort_order)
       VALUES (?, 'T01', 'First', 'Do first', 'pending', 0),
              (?, 'T02', 'Second', 'Do second', 'pending', 1)`
    ).run(session.id, session.id);
    db.close();

    await runStateQuery({ cwd: dir, slice: "active-task" });
    const out = await import("../lib/state/query.js").then((m) =>
      m.querySlice(dir, "active-task")
    );
    expect(out).toContain("T01");
    expect(out).not.toContain("T02");
  });

  it("S07 — FTS search finds decision", async () => {
    const dir = await createProjectDir("state-search");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    await runStateStatus({ cwd: dir });
    insertDecision(dir, "use locale es for init wizard", "refining");

    const { searchState } = await import("../lib/state/fts.js");
    const hits = searchState(dir, "locale");
    expect(hits.length).toBeGreaterThan(0);
  });

  it("S08 — export writes history", async () => {
    const dir = await createProjectDir("state-export");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    const db = openDatabase(dir);
    const session = ensureActiveSession(db);
    db.prepare(
      "INSERT INTO artifacts (session_id, kind, content, updated_at) VALUES (?, 'task', '# Task', ?)"
    ).run(session.id, new Date().toISOString());
    db.close();

    await runStateExport({ cwd: dir });

    const historyDir = path.join(
      dir,
      ".agents-state",
      "history",
      session.id
    );
    expect(await fs.pathExists(path.join(historyDir, "task.md"))).toBe(true);
  });

  it("S09 — status shows state db line", async () => {
    const dir = await createProjectDir("state-status-line");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    await runStateStartSession({ cwd: dir });
    await runStateSetPhase({ cwd: dir, phase: "implementing" });

    const logs: string[] = [];
    const orig = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };
    try {
      await runStatus({ cwd: dir });
    } finally {
      console.log = orig;
    }
    expect(logs.some((l) => l.includes("State DB:"))).toBe(true);
  });

  it("sync-task updates task status", async () => {
    const dir = await createProjectDir("state-sync-task");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    const db = openDatabase(dir);
    const session = ensureActiveSession(db);
    db.prepare(
      `INSERT INTO tasks (session_id, code, title, body, status, sort_order)
       VALUES (?, 'T01', 'X', 'Y', 'pending', 0)`
    ).run(session.id);
    db.close();

    syncTaskStatus(dir, "T01", "done");
    const out = await import("../lib/state/query.js").then((m) =>
      m.querySlice(dir, "active-task")
    );
    expect(out).toBeNull();
  });

  it("S10 — start-session creates new active session", async () => {
    const dir = await createProjectDir("state-start");
    await installTestProject(dir, { includeDocs: false, tools: [] });

    await runStateStartSession({ cwd: dir });

    const phase = await import("../lib/state/query.js").then((m) =>
      m.querySlice(dir, "phase")
    );
    expect(phase).toBe("refining");
  });

  it("S11 — start-session rejects when active exists", async () => {
    const dir = await createProjectDir("state-start-dup");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    await runStateStartSession({ cwd: dir });

    await expect(runStateStartSession({ cwd: dir })).rejects.toMatchObject({
      code: "ACTIVE_SESSION",
    });
  });

  it("S12 — write-artifact and mirror approval files", async () => {
    const dir = await createProjectDir("state-write-mirror");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    await runStateStartSession({ cwd: dir });

    const sddPath = path.join(dir, "input-sdd.md");
    await fs.writeFile(sddPath, "# SDD: Test\n\n## Summary\nHello\n");

    await runStateWriteArtifact({
      cwd: dir,
      kind: "sdd",
      file: sddPath,
    });

    await runStateMirrorApproval({ cwd: dir });

    expect(await fs.pathExists(path.join(dir, ".agents-state", "current", "sdd.md"))).toBe(
      true
    );
    const currentFiles = await fs.readdir(
      path.join(dir, ".agents-state", "current")
    );
    expect(currentFiles.sort()).toEqual(["sdd.md"]);
  });

  it("S13 — close-session archives active session", async () => {
    const dir = await createProjectDir("state-close");
    await installTestProject(dir, { includeDocs: false, tools: [] });
    await runStateStartSession({ cwd: dir });

    await runStateCloseSession({ cwd: dir });

    const logs: string[] = [];
    const orig = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };
    try {
      await runStateListSessions({ cwd: dir, status: "archived" });
    } finally {
      console.log = orig;
    }
    expect(logs.some((l) => l.includes("archived"))).toBe(true);
  });
});
