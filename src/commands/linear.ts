import * as clack from "@clack/prompts";
import { assertProjectInstalled } from "../lib/project-guard.js";
import { resolveTargetDir } from "../lib/paths.js";
import {
  readLinearConfig,
  writeLinearConfig,
  defaultLinearConfig,
  DEFAULT_LINEAR_STATES,
  type LinearConfig,
} from "../lib/linear-config.js";
import { InitCancelledError } from "../lib/init-cancelled.js";
import { SpecflowCliError } from "../errors.js";
import type { Locale } from "../lib/i18n.js";
import { readProjectConfig } from "../lib/project-config.js";

export interface LinearSetupOptions {
  cwd?: string;
  enable?: boolean;
  disable?: boolean;
}

function throwIfCancelled<T>(value: T | symbol): T {
  if (clack.isCancel(value)) {
    throw new InitCancelledError();
  }
  return value;
}

function messages(locale: Locale) {
  return locale === "es"
    ? {
        intro: "Configuración Linear (Cursor + MCP)",
        enablePrompt: "¿Activar sincronización de estados con Linear?",
        teamPrompt: "Equipo Linear (opcional, Enter para omitir)",
        stateRefining: 'Estado al terminar refining (default: "Todo")',
        stateApprove: 'Estado tras /approve (default: "In Progress")',
        statePass: 'Estado tras review PASS (default: "Done")',
        stateFail: 'Estado tras review FAIL (default: "In Progress")',
        saved: "Linear configurado.",
        disabled: "Linear desactivado.",
        requiresTty: "specflow linear setup requiere terminal interactiva.",
      }
    : {
        intro: "Linear setup (Cursor + MCP)",
        enablePrompt: "Enable Linear issue state sync?",
        teamPrompt: "Linear team (optional, Enter to skip)",
        stateRefining: 'State after refining (default: "Todo")',
        stateApprove: 'State after /approve (default: "In Progress")',
        statePass: 'State after review PASS (default: "Done")',
        stateFail: 'State after review FAIL (default: "In Progress")',
        saved: "Linear configured.",
        disabled: "Linear disabled.",
        requiresTty: "specflow linear setup requires an interactive terminal.",
      };
}

async function promptConfig(locale: Locale): Promise<LinearConfig> {
  const m = messages(locale);
  clack.intro(m.intro);

  const enabled = throwIfCancelled(
    await clack.confirm({
      message: m.enablePrompt,
      initialValue: true,
    })
  );

  if (!enabled) {
    return defaultLinearConfig(false);
  }

  const teamRaw = throwIfCancelled(
    await clack.text({
      message: m.teamPrompt,
      placeholder: "",
      defaultValue: "",
    })
  );
  const team =
    typeof teamRaw === "string" && teamRaw.trim() ? teamRaw.trim() : undefined;

  const onRefiningComplete = await promptState(
    m.stateRefining,
    DEFAULT_LINEAR_STATES.onRefiningComplete
  );
  const onApprove = await promptState(m.stateApprove, DEFAULT_LINEAR_STATES.onApprove);
  const onReviewPass = await promptState(
    m.statePass,
    DEFAULT_LINEAR_STATES.onReviewPass
  );
  const onReviewFail = await promptState(
    m.stateFail,
    DEFAULT_LINEAR_STATES.onReviewFail
  );

  return {
    enabled: true,
    team,
    states: {
      onRefiningComplete,
      onApprove,
      onReviewPass,
      onReviewFail,
    },
  };
}

async function promptState(
  message: string,
  defaultValue: string
): Promise<string> {
  const raw = throwIfCancelled(
    await clack.text({
      message,
      defaultValue,
      placeholder: defaultValue,
    })
  );
  const value = typeof raw === "string" ? raw.trim() : "";
  return value || defaultValue;
}

export async function runLinearSetup(
  options: LinearSetupOptions
): Promise<void> {
  if (!process.stdin.isTTY) {
    throw new SpecflowCliError("NO_TTY", messages("en").requiresTty);
  }

  const targetDir = resolveTargetDir(options.cwd);
  await assertProjectInstalled(targetDir);

  const projectConfig = await readProjectConfig(targetDir);
  const locale = projectConfig?.locale ?? "en";

  let config: LinearConfig;
  if (options.disable) {
    config = defaultLinearConfig(false);
  } else if (options.enable) {
    config = defaultLinearConfig(true);
  } else {
    config = await promptConfig(locale);
  }

  await writeLinearConfig(targetDir, config);
  const m = messages(locale);
  clack.outro(config.enabled ? m.saved : m.disabled);
}
