#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runSync } from "./commands/sync.js";
import { runStatus } from "./commands/status.js";
import { runDoctor } from "./commands/doctor.js";
import {
  runToolsList,
  runToolsAdd,
  runToolsRemove,
} from "./commands/tools.js";
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

program
  .command("doctor")
  .description("Verify SpecFlow install, flow state, and optional verification commands")
  .option("-C, --cwd <dir>", "Target directory", process.cwd())
  .option("--run", "Execute commands from .agents-docs/verification.md")
  .option("--json", "JSON output")
  .action(async (opts: { cwd: string; run?: boolean; json?: boolean }) => {
    runCommandAction(async () => {
      const report = await runDoctor({
        cwd: opts.cwd,
        run: opts.run,
        json: opts.json,
      });
      if (report.hasErrors) process.exit(1);
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
