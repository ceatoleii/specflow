#!/usr/bin/env node
import { Command } from "commander";
import { SpecflowCliError } from "./errors.js";
import { runInit } from "./commands/init.js";
import { runSync } from "./commands/sync.js";
import { runStatus } from "./commands/status.js";
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
  .description("Spec-driven multi-agent workflow for Cursor and AI tools")
  .version(getCliVersion());

program
  .command("init")
  .description("Install SpecFlow in the current project")
  .option("-C, --cwd <dir>", "Target project directory", process.cwd())
  .option("--no-docs", "Skip scaffolding .agents-docs/")
  .option("--dry-run", "Show what would be written without writing")
  .action(async (opts: { cwd: string; docs: boolean; dryRun?: boolean }) => {
    try {
      await runInit({
        cwd: opts.cwd,
        noDocs: opts.docs === false,
        dryRun: opts.dryRun,
      });
    } catch (e) {
      handleCliError(e);
    }
  });

program
  .command("sync")
  .description("Update SpecFlow engine files (never touches .agents-docs/)")
  .option("-C, --cwd <dir>", "Target project directory", process.cwd())
  .option("--dry-run", "Show what would change without writing")
  .option("-y, --yes", "Proceed even if a flow task is active")
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
  .description("Show installed vs CLI version")
  .option("-C, --cwd <dir>", "Target project directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    try {
      const result = await runStatus({ cwd: opts.cwd });
      if (result === "not_installed") process.exit(1);
    } catch (e) {
      handleCliError(e);
    }
  });

program.parse();
