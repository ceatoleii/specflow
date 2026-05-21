#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runSync } from "./commands/sync.js";
import { runStatus } from "./commands/status.js";
import {
  runToolsList,
  runToolsAdd,
  runToolsRemove,
} from "./commands/tools.js";
import {
  runStateStatus,
  runStateQuery,
  runStateSearch,
  runStateMigrate,
  runStateExport,
  runStateSetPhase,
  runStateSyncTask,
  runStateEnsure,
  runStateStartSession,
  runStateCloseSession,
  runStateListSessions,
  runStateWriteArtifact,
  runStateAppendMessage,
  runStateSyncCriteria,
  runStateSyncTasks,
  runStateMirrorApproval,
} from "./commands/state.js";
import { getCliVersion } from "./lib/version.js";
import { runCommandAction } from "./lib/cli-action.js";

const program = new Command();

program
  .name("specflow")
  .description(
    "Spec-driven multi-agent workflow for Cursor, Claude Code, Copilot, Codex, and more"
  )
  .version(getCliVersion());

program
  .command("init")
  .description("Install SpecFlow (interactive)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .option("--no-docs", "Skip .agents-docs/ scaffold")
  .option("--dry-run", "Preview without writing")
  .action(
    (opts: {
      cwd: string;
      docs: boolean;
      dryRun?: boolean;
    }) => {
      runCommandAction(
        () =>
          runInit({
            cwd: opts.cwd,
            noDocs: opts.docs === false,
            dryRun: opts.dryRun,
          }),
        { onCancel: () => process.exit(0) }
      );
    }
  );

program
  .command("sync")
  .description("Update core + installed adapters (never .agents-docs/)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .option("--dry-run", "Preview changes")
  .option("-y, --yes", "Allow sync while flow task is active")
  .action((opts: { cwd: string; dryRun?: boolean; yes?: boolean }) => {
    runCommandAction(() =>
      runSync({
        cwd: opts.cwd,
        dryRun: opts.dryRun,
        yes: opts.yes,
      })
    );
  });

program
  .command("status")
  .description("Show version, adapters, and flow state")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    runCommandAction(async () => {
      const result = await runStatus({ cwd: opts.cwd });
      if (result === "not_installed") process.exit(1);
    });
  });

const tools = program
  .command("tools")
  .description("Manage IDE adapters");

tools
  .command("list")
  .description("List installed and available adapters")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    runCommandAction(() => runToolsList({ cwd: opts.cwd }));
  });

tools
  .command("add")
  .description("Add IDE adapters (interactive)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .option("--dry-run", "Preview changes")
  .action(async (opts: { cwd: string; dryRun?: boolean }) => {
    runCommandAction(() =>
      runToolsAdd({ cwd: opts.cwd, dryRun: opts.dryRun })
    );
  });

const state = program
  .command("state")
  .description("Flow state database (SQLite)");

state
  .command("ensure")
  .description("Bootstrap state.db per .specflow-config.json (flow activation)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    runCommandAction(() => runStateEnsure({ cwd: opts.cwd }));
  });

state
  .command("status")
  .description("Show state.db session and phase")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    runCommandAction(() => runStateStatus({ cwd: opts.cwd }));
  });

state
  .command("start-session")
  .description("Start a new flow session (one per task)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .option("--title <text>", "Optional session title")
  .action(async (opts: { cwd: string; title?: string }) => {
    runCommandAction(() =>
      runStateStartSession({ cwd: opts.cwd, title: opts.title })
    );
  });

state
  .command("close-session")
  .description("Archive the active session without full export")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    runCommandAction(() => runStateCloseSession({ cwd: opts.cwd }));
  });

state
  .command("list-sessions")
  .description("List flow sessions")
  .option(
    "--status <status>",
    "Filter: active or archived"
  )
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string; status?: string }) => {
    runCommandAction(() =>
      runStateListSessions({ cwd: opts.cwd, status: opts.status })
    );
  });

state
  .command("write-artifact")
  .description("Write artifact content to state.db")
  .requiredOption("--kind <kind>", "task|refinement|sdd|tasks|review")
  .option("--file <path>", "Read content from file")
  .option("--stdin", "Read content from stdin")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(
    async (opts: {
      cwd: string;
      kind: string;
      file?: string;
      stdin?: boolean;
    }) => {
      runCommandAction(() =>
        runStateWriteArtifact({
          cwd: opts.cwd,
          kind: opts.kind,
          file: opts.file,
          stdin: opts.stdin,
        })
      );
    }
  );

state
  .command("append-message")
  .description("Append refinement message to state.db")
  .requiredOption("--round <n>", "Refinement round number", parseInt)
  .requiredOption("--role <role>", "user or agent")
  .option("--file <path>", "Read content from file")
  .option("--stdin", "Read content from stdin")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(
    async (opts: {
      cwd: string;
      round: number;
      role: string;
      file?: string;
      stdin?: boolean;
    }) => {
      runCommandAction(() =>
        runStateAppendMessage({
          cwd: opts.cwd,
          round: opts.round,
          role: opts.role,
          file: opts.file,
          stdin: opts.stdin,
        })
      );
    }
  );

state
  .command("sync-criteria")
  .description("Sync acceptance criteria from task artifact")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    runCommandAction(() => runStateSyncCriteria({ cwd: opts.cwd }));
  });

state
  .command("sync-tasks")
  .description("Parse tasks markdown into state.db")
  .option("--file <path>", "Read tasks markdown from file")
  .option("--stdin", "Read from stdin")
  .option("--no-mirror", "Skip sdd.md/tasks.md mirror")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(
    async (opts: {
      cwd: string;
      file?: string;
      stdin?: boolean;
      noMirror?: boolean;
    }) => {
      runCommandAction(() =>
        runStateSyncTasks({
          cwd: opts.cwd,
          file: opts.file,
          stdin: opts.stdin,
          noMirror: opts.noMirror,
        })
      );
    }
  );

state
  .command("mirror-approval")
  .description("Mirror sdd + tasks from DB to current/ for human review")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    runCommandAction(() => runStateMirrorApproval({ cwd: opts.cwd }));
  });

state
  .command("query")
  .description("Query a state slice")
  .requiredOption(
    "--slice <name>",
    "phase|task|active-task|criteria|decisions|sdd-summary"
  )
  .option("--json", "JSON output")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(
    async (opts: { cwd: string; slice: string; json?: boolean }) => {
      runCommandAction(() =>
        runStateQuery({
          cwd: opts.cwd,
          slice: opts.slice,
          json: opts.json,
        })
      );
    }
  );

state
  .command("search")
  .description("FTS search decisions and messages")
  .argument("<term>", "Search term")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (term: string, opts: { cwd: string }) => {
    runCommandAction(() => runStateSearch({ cwd: opts.cwd, term }));
  });

state
  .command("migrate")
  .description("Import legacy .agents-state/current/*.md into state.db")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    runCommandAction(() => runStateMigrate({ cwd: opts.cwd }));
  });

state
  .command("export")
  .description("Export active session to .agents-state/history/")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    runCommandAction(() => runStateExport({ cwd: opts.cwd }));
  });

state
  .command("set-phase")
  .description("Set flow phase in state.db")
  .argument("<phase>", "refining|designing|implementing|reviewing")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (phase: string, opts: { cwd: string }) => {
    runCommandAction(() => runStateSetPhase({ cwd: opts.cwd, phase }));
  });

state
  .command("sync-task")
  .description("Update task status in state.db")
  .requiredOption("--code <id>", "Task code e.g. T01")
  .requiredOption("--status <status>", "pending|in_progress|done")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(
    async (opts: { cwd: string; code: string; status: string }) => {
      runCommandAction(() =>
        runStateSyncTask({
          cwd: opts.cwd,
          code: opts.code,
          status: opts.status,
        })
      );
    }
  );

tools
  .command("remove")
  .description("Remove IDE adapters (interactive)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .option("--dry-run", "Preview changes")
  .action(async (opts: { cwd: string; dryRun?: boolean }) => {
    runCommandAction(() =>
      runToolsRemove({ cwd: opts.cwd, dryRun: opts.dryRun })
    );
  });

program.parse();
