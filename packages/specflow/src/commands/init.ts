import { installCoreAndAdapters } from "../lib/install.js";
import { runInitPrompts } from "../lib/prompts.js";
import { resolveTargetDir } from "../lib/paths.js";
import { readProjectVersion, getCliVersion } from "../lib/version.js";
import { SpecflowCliError } from "../errors.js";
import { InitCancelledError } from "../lib/init-cancelled.js";
import { t, tPreLocale } from "../lib/i18n.js";

export interface InitOptions {
  cwd?: string;
  noDocs?: boolean;
  dryRun?: boolean;
}

export async function runInit(options: InitOptions): Promise<void> {
  if (!process.stdin.isTTY) {
    throw new SpecflowCliError("NO_TTY", tPreLocale("initRequiresTty"));
  }

  const targetDir = resolveTargetDir(options.cwd);
  const cliVersion = getCliVersion();
  const dryRun = options.dryRun ?? false;

  const existing = await readProjectVersion(targetDir);

  const answers = await runInitPrompts(targetDir, {
    alreadyInstalledVersion: existing && !dryRun ? existing.specflow : undefined,
  });

  const messages = t(answers.locale);
  const tools = answers.tools;
  const includeDocs = options.noDocs ? false : answers.includeDocs;

  const spinner = (await import("@clack/prompts")).spinner();
  spinner.start(messages.installing(cliVersion, targetDir));

  try {
    await installCoreAndAdapters({
      targetDir,
      tools,
      includeDocs,
      dryRun,
      locale: answers.locale,
      stateDb: answers.stateDb,
    });
  } catch (error) {
    spinner.stop("");
    throw error;
  }

  const { outro } = await import("@clack/prompts");

  if (dryRun) {
    spinner.stop("");
    outro(messages.dryRunDone);
    return;
  }

  spinner.stop(messages.installDone(cliVersion));

  if (answers.stateDb) {
    const { ensureStateForProject } = await import(
      "../lib/state/ensure.js"
    );
    const state = await ensureStateForProject(targetDir);
    if (state.bootstrapped) {
      console.log(`\n→ State DB ready (session ${state.sessionId})`);
      if (state.migrated) {
        console.log("→ Imported legacy .agents-state/current/ into state.db");
      }
    }
  }

  const outroLines = [messages.editDocs, messages.activateFlow];
  if (answers.stateDb) {
    outroLines.unshift(
      answers.locale === "es"
        ? "Flujo: state.db activo (specflow state …)"
        : "Flow: state.db enabled (specflow state …)"
    );
  }
  if (tools.length) {
    outroLines.unshift(messages.adaptersLine(tools.join(", ")));
  }
  outro(outroLines.join("\n"));
}

export { InitCancelledError };
