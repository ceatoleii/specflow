import * as clack from "@clack/prompts";
import { renderBanner } from "./banner.js";
import { InitCancelledError } from "./init-cancelled.js";
import { t, type Locale } from "./i18n.js";
import { loadManifest, getInitAdapterIds } from "./manifest.js";
import { getCliVersion } from "./version.js";
import { readProjectConfig } from "./project-config.js";

export interface InitAnswers {
  targetDir: string;
  tools: string[];
  includeDocs: boolean;
  locale: Locale;
  linearEnabled: boolean;
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

  const initAdapterIds = getInitAdapterIds(manifest);
  const installCursor = throwIfCancelled(
    await clack.confirm({
      message: messages.cursorAdapterPrompt,
      initialValue: true,
    })
  );
  const tools = installCursor ? [...initAdapterIds] : [];

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

  const linearEnabled = throwIfCancelled(
    await clack.confirm({
      message: messages.linearEnablePrompt,
      initialValue: false,
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
      `${messages.summaryLinear}: ${
        linearEnabled ? messages.summaryLinearYes : messages.summaryLinearNo
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
    linearEnabled,
  };
}

export async function runToolsAddPrompts(
  targetDir: string,
  installed: string[]
): Promise<string[]> {
  const manifest = await loadManifest();
  const available = Object.entries(manifest.adapters)
    .filter(([id]) => !installed.includes(id) && id === "cursor")
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
