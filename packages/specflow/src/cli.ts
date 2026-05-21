#!/usr/bin/env node
import { Command } from "commander";
import { SpecflowCliError } from "./errors.js";
import { runInit } from "./commands/init.js";
import { runSync } from "./commands/sync.js";
import { runStatus } from "./commands/status.js";
import {
  runToolsList,
  runToolsAdd,
  runToolsRemove,
} from "./commands/tools.js";
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
  .option("-y, --yes", "Non-interactive: all stable tools + docs")
  .option("--no-docs", "Skip .agents-docs/ scaffold")
  .option("--dry-run", "Preview without writing")
  .action(
    async (opts: {
      cwd: string;
      yes?: boolean;
      docs: boolean;
      dryRun?: boolean;
    }) => {
      try {
        await runInit({
          cwd: opts.cwd,
          yes: opts.yes,
          noDocs: opts.docs === false,
          dryRun: opts.dryRun,
        });
      } catch (e) {
        if (e instanceof Error && e.message === "Instalación cancelada.") {
          console.log("\n  Cancelado.");
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
