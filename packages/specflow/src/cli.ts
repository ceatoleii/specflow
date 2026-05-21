#!/usr/bin/env node
import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runSync } from "./commands/sync.js";
import { runStatus } from "./commands/status.js";
import { getCliVersion } from "./lib/version.js";

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
    await runInit({
      cwd: opts.cwd,
      noDocs: opts.docs === false,
      dryRun: opts.dryRun,
    });
  });

program
  .command("sync")
  .description("Update SpecFlow engine files (never touches .agents-docs/)")
  .option("-C, --cwd <dir>", "Target project directory", process.cwd())
  .option("--dry-run", "Show what would change without writing")
  .option("-y, --yes", "Proceed even if a flow task is active")
  .action(async (opts: { cwd: string; dryRun?: boolean; yes?: boolean }) => {
    await runSync({
      cwd: opts.cwd,
      dryRun: opts.dryRun,
      yes: opts.yes,
    });
  });

program
  .command("status")
  .description("Show installed vs CLI version")
  .option("-C, --cwd <dir>", "Target project directory", process.cwd())
  .action(async (opts: { cwd: string }) => {
    await runStatus({ cwd: opts.cwd });
  });

program.parse();
