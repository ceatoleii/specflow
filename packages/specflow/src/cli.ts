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
  .description("Set flow phase (updates state.db and phase.md)")
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
