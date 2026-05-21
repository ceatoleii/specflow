#!/usr/bin/env node
import { Command } from "commander";
import { SpecflowCliError } from "./errors.js";
import { runInit, InitCancelledError } from "./commands/init.js";
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

function handleCliError(error: unknown): never {
  if (error instanceof SpecflowCliError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}

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
    async (opts: {
      cwd: string;
      docs: boolean;
      dryRun?: boolean;
    }) => {
      try {
        await runInit({
          cwd: opts.cwd,
          noDocs: opts.docs === false,
          dryRun: opts.dryRun,
        });
      } catch (e) {
        if (e instanceof InitCancelledError) {
          process.exit(0);
        }
        handleCliError(e);
      }
    }
  );

program
  .command("sync")
  .description("Update core + installed adapters (never .agents-docs/)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .option("--dry-run", "Preview changes")
  .option("-y, --yes", "Allow sync while flow task is active")
  .action(async (opts: { cwd: string; dryRun?: boolean; yes?: boolean }) => {
    try {
      await runSync({
        cwd: opts.cwd,
        dryRun: opts.dryRun,
        yes: opts.yes,
      });
    } catch (e) {
      handleCliError(e);
    }
  });

program
  .command("status")
  .description("Show version, adapters, and flow state")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    try {
      const result = await runStatus({ cwd: opts.cwd });
      if (result === "not_installed") process.exit(1);
    } catch (e) {
      handleCliError(e);
    }
  });

const tools = program
  .command("tools")
  .description("Manage IDE adapters");

tools
  .command("list")
  .description("List installed and available adapters")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    try {
      await runToolsList({ cwd: opts.cwd });
    } catch (e) {
      handleCliError(e);
    }
  });

tools
  .command("add")
  .description("Add IDE adapters (interactive)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .option("--dry-run", "Preview changes")
  .action(async (opts: { cwd: string; dryRun?: boolean }) => {
    try {
      await runToolsAdd({ cwd: opts.cwd, dryRun: opts.dryRun });
    } catch (e) {
      handleCliError(e);
    }
  });

const state = program
  .command("state")
  .description("Flow state database (SQLite)");

state
  .command("ensure")
  .description("Bootstrap state.db per .specflow-config.json (flow activation)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    try {
      await runStateEnsure({ cwd: opts.cwd });
    } catch (e) {
      handleCliError(e);
    }
  });

state
  .command("status")
  .description("Show state.db session and phase")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    try {
      await runStateStatus({ cwd: opts.cwd });
    } catch (e) {
      handleCliError(e);
    }
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
      try {
        await runStateQuery({
          cwd: opts.cwd,
          slice: opts.slice,
          json: opts.json,
        });
      } catch (e) {
        handleCliError(e);
      }
    }
  );

state
  .command("search")
  .description("FTS search decisions and messages")
  .argument("<term>", "Search term")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (term: string, opts: { cwd: string }) => {
    try {
      await runStateSearch({ cwd: opts.cwd, term });
    } catch (e) {
      handleCliError(e);
    }
  });

state
  .command("migrate")
  .description("Import legacy .agents-state/current/*.md into state.db")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    try {
      await runStateMigrate({ cwd: opts.cwd });
    } catch (e) {
      handleCliError(e);
    }
  });

state
  .command("export")
  .description("Export active session to .agents-state/history/")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    try {
      await runStateExport({ cwd: opts.cwd });
    } catch (e) {
      handleCliError(e);
    }
  });

state
  .command("set-phase")
  .description("Set flow phase (updates state.db and phase.md)")
  .argument("<phase>", "refining|designing|implementing|reviewing")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(async (phase: string, opts: { cwd: string }) => {
    try {
      await runStateSetPhase({ cwd: opts.cwd, phase });
    } catch (e) {
      handleCliError(e);
    }
  });

state
  .command("sync-task")
  .description("Update task status in state.db")
  .requiredOption("--code <id>", "Task code e.g. T01")
  .requiredOption("--status <status>", "pending|in_progress|done")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .action(
    async (opts: { cwd: string; code: string; status: string }) => {
      try {
        await runStateSyncTask({
          cwd: opts.cwd,
          code: opts.code,
          status: opts.status,
        });
      } catch (e) {
        handleCliError(e);
      }
    }
  );

tools
  .command("remove")
  .description("Remove IDE adapters (interactive)")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .option("--dry-run", "Preview changes")
  .action(async (opts: { cwd: string; dryRun?: boolean }) => {
    try {
      await runToolsRemove({ cwd: opts.cwd, dryRun: opts.dryRun });
    } catch (e) {
      handleCliError(e);
    }
  });

program.parse();
