import { loadManifest } from "./manifest.js";
import type { SpecflowManifestV2 } from "./manifest.js";
import {
  copyAdapter,
  copyCoreScaffold,
  copyCoreStatic,
  printCopyResult,
  type CopyResult,
} from "./copy.js";
import { ensureGitignoreEntries } from "./gitignore.js";
import { writeProjectTools } from "./tools-config.js";
import { writeProjectVersion } from "./version.js";
import { getCliVersion } from "./version.js";
import { writeProjectConfig } from "./project-config.js";
import type { Locale } from "./i18n.js";

export interface InstallCoreOptions {
  targetDir: string;
  tools: string[];
  includeDocs: boolean;
  dryRun: boolean;
  locale: Locale;
}

interface CopyAdaptersOptions {
  dryRun: boolean;
  logEmptyAdapters?: boolean;
}

async function copyInstalledAdapters(
  targetDir: string,
  tools: string[],
  manifest: SpecflowManifestV2,
  options: CopyAdaptersOptions
): Promise<void> {
  const { dryRun, logEmptyAdapters = false } = options;

  for (const toolId of tools) {
    const adapter = manifest.adapters[toolId];
    if (!adapter) continue;

    if (adapter.files.length === 0) {
      if (logEmptyAdapters) {
        console.log(
          `\n  Adaptador ${adapter.label}: usa AGENTS.md (sin archivos extra)`
        );
      }
      continue;
    }

    const adapterResult = await copyAdapter(
      targetDir,
      toolId,
      adapter.files,
      { dryRun }
    );
    printCopyResult(`Adaptador: ${adapter.label}`, adapterResult, dryRun);
  }
}

export async function installCoreAndAdapters(
  options: InstallCoreOptions
): Promise<void> {
  const manifest = await loadManifest();
  const { targetDir, tools, includeDocs, dryRun, locale } = options;

  const coreResult = await copyCoreStatic(
    targetDir,
    manifest.core.static,
    { dryRun }
  );
  printCopyResult("Core (AGENTS.md, .agents/)", coreResult, dryRun);

  let scaffoldResult: CopyResult = {
    created: [],
    updated: [],
    skipped: [],
  };
  if (includeDocs) {
    scaffoldResult = await copyCoreScaffold(
      targetDir,
      manifest.core.scaffold,
      { dryRun }
    );
    printCopyResult("Docs (.agents-docs/, solo nuevos)", scaffoldResult, dryRun);
  }

  await copyInstalledAdapters(targetDir, tools, manifest, {
    dryRun,
    logEmptyAdapters: true,
  });

  if (!dryRun) {
    const gitignoreAdded = await ensureGitignoreEntries(
      targetDir,
      manifest.gitignoreEntries
    );
    if (gitignoreAdded.length) {
      console.log("\n  .gitignore:");
      for (const e of gitignoreAdded) console.log(`    + ${e}`);
    }

    await writeProjectVersion(
      targetDir,
      getCliVersion(),
      manifest.manifestVersion
    );
    await writeProjectTools(targetDir, tools, manifest.manifestVersion);
    await writeProjectConfig(targetDir, {
      locale,
      includeDocs,
      manifestVersion: manifest.manifestVersion,
    });
  }
}

export async function syncCoreAndAdapters(
  targetDir: string,
  tools: string[],
  dryRun: boolean
): Promise<void> {
  const manifest = await loadManifest();

  const coreResult = await copyCoreStatic(
    targetDir,
    manifest.core.static,
    { dryRun }
  );
  printCopyResult("Core actualizado", coreResult, dryRun);

  await copyInstalledAdapters(targetDir, tools, manifest, { dryRun });

  if (!dryRun) {
    await writeProjectVersion(
      targetDir,
      getCliVersion(),
      manifest.manifestVersion
    );
    await writeProjectTools(targetDir, tools, manifest.manifestVersion);
  }
}
