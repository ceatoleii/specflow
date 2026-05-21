import * as clack from "@clack/prompts";
import fs from "fs-extra";
import path from "node:path";
import { renderBanner } from "./banner.js";
import { InitCancelledError } from "./init-cancelled.js";
import { t, type Locale } from "./i18n.js";
import { loadManifest, getStableAdapterIds } from "./manifest.js";
import { detectLegacyTools } from "./tools-config.js";
import { getCliVersion } from "./version.js";
import { readProjectConfig } from "./project-config.js";

export interface InitAnswers {
  targetDir: string;
  tools: string[];
  includeDocs: boolean;
  locale: Locale;
  stateDb: boolean;
}

function throwIfCancelled<T>(value: T | symbol): T {
  if (clack.isCancel(value)) {
    throw new InitCancelledError();
  }
  return value;
}

export async function runInitPrompts(
  targetDir: string,
  options: { alreadyInstalledVersion?: string }
): Promise<InitAnswers> {
  const manifest = await loadManifest();
  const version = getCliVersion();

  clack.intro(renderBanner(version));

  const locale = throwIfCancelled(
    await clack.select({
      message: t("en").languagePrompt,
      options: [
        { value: "es" as const, label: "Español" },
        { value: "en" as const, label: "English" },
      ],
    })
  );

  const messages = t(locale);
  clack.log.message(messages.introSubtitle);

  const existingConfig = await readProjectConfig(targetDir);

  if (options.alreadyInstalledVersion) {
    clack.note(
      messages.alreadyInstalled(options.alreadyInstalledVersion),
      "SpecFlow"
    );
  }

  const proceed = throwIfCancelled(
    await clack.confirm({
      message: messages.confirmDirectory(targetDir),
      initialValue: true,
    })
  );
  if (!proceed) {
    clack.cancel(messages.cancelled);
    throw new InitCancelledError();
  }

  const legacy = await detectLegacyTools(targetDir);
  const defaultChecked = new Set(
    legacy.length > 0 ? legacy : getStableAdapterIds(manifest)
  );

  const toolOptions = Object.entries(manifest.adapters).map(([id, adapter]) => ({
    value: id,
    label:
      adapter.tier === "experimental"
        ? `${adapter.label} [experimental]`
        : adapter.label,
  }));

  let tools = throwIfCancelled(
    await clack.multiselect({
      message: messages.toolsPrompt,
      options: toolOptions,
      initialValues: toolOptions
        .filter((o) => defaultChecked.has(o.value))
        .map((o) => o.value),
      required: false,
    })
  );

  const coreOnly = throwIfCancelled(
    await clack.confirm({
      message: messages.coreOnlyPrompt,
      initialValue: false,
    })
  );

  if (coreOnly) {
    tools = [];
  }

  if (tools.length === 0 && !coreOnly) {
    const onlyCore = throwIfCancelled(
      await clack.confirm({
        message: messages.noToolsSelected,
        initialValue: true,
      })
    );
    if (!onlyCore) {
      clack.cancel(messages.cancelled);
      throw new InitCancelledError();
    }
    tools = [];
  }

  const hasExperimental = tools.some(
    (id) => manifest.adapters[id]?.tier === "experimental"
  );
  const hasStable = tools.some(
    (id) => manifest.adapters[id]?.tier === "stable"
  );

  if (hasExperimental && !hasStable && tools.length > 0) {
    const ok = throwIfCancelled(
      await clack.confirm({
        message: messages.experimentalOnly,
        initialValue: false,
      })
    );
    if (!ok) {
      clack.cancel(messages.cancelled);
      throw new InitCancelledError();
    }
  }

  if (tools.includes("claude-code")) {
    const claudePath = path.join(targetDir, "CLAUDE.md");
    if (await fs.pathExists(claudePath)) {
      const ok = throwIfCancelled(
        await clack.confirm({
          message: messages.claudeOverwrite,
          initialValue: false,
        })
      );
      if (!ok) {
        tools = tools.filter((toolId) => toolId !== "claude-code");
      }
    }
  }

  const docsChoice = throwIfCancelled(
    await clack.select({
      message: messages.docsPrompt,
      options: [
        { value: "yes" as const, label: messages.docsYes },
        { value: "no" as const, label: messages.docsNo },
      ],
      initialValue: "yes" as const,
    })
  );

  const adapterSummary =
    tools.length > 0
      ? tools.map((id) => manifest.adapters[id]?.label ?? id).join(", ")
      : messages.summaryAdaptersCoreOnly;

  clack.note(
    [
      `${messages.summaryDirectory}: ${targetDir}`,
      `${messages.summaryAdapters}: ${adapterSummary}`,
      `${messages.summaryDocs}: ${
        docsChoice === "yes" ? messages.summaryDocsYes : messages.summaryDocsNo
      }`,
    ].join("\n"),
    messages.summaryTitle
  );

  const confirmInstall = throwIfCancelled(
    await clack.confirm({
      message: messages.confirmInstall,
      initialValue: true,
    })
  );
  if (!confirmInstall) {
    clack.cancel(messages.cancelled);
    throw new InitCancelledError();
  }

  return {
    targetDir,
    tools,
    includeDocs: docsChoice === "yes",
    locale,
    stateDb: true,
  };
}

export async function runToolsAddPrompts(
  targetDir: string,
  installed: string[]
): Promise<string[]> {
  const manifest = await loadManifest();
  const available = Object.entries(manifest.adapters)
    .filter(([id]) => !installed.includes(id))
    .map(([id, adapter]) => ({
      name:
        adapter.tier === "experimental"
          ? `${adapter.label} [experimental]`
          : adapter.label,
      value: id,
    }));

  if (available.length === 0) {
    console.log("\n  Todas las herramientas ya están instaladas.");
    return [];
  }

  const { checkbox } = await import("@inquirer/prompts");
  return checkbox({
    message: "¿Qué adaptadores agregar?",
    choices: available,
  });
}

export async function runToolsRemovePrompts(
  installed: string[]
): Promise<string[]> {
  const manifest = await loadManifest();
  const { checkbox } = await import("@inquirer/prompts");

  return checkbox({
    message: "¿Qué adaptadores quitar?",
    choices: installed.map((id) => ({
      name: manifest.adapters[id]?.label ?? id,
      value: id,
    })),
  });
}
