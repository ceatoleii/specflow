import { loadManifest } from "./manifest.js";
import {
  copyAdapter,
  copyCoreScaffold,
  copyCoreStatic,
  mergeResults,
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

  for (const toolId of tools) {
    const adapter = manifest.adapters[toolId];
    if (!adapter) continue;

    if (adapter.files.length === 0) {
      console.log(`\n  Adaptador ${adapter.label}: usa AGENTS.md (sin archivos extra)`);
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
    await writeProjectConfig(
      targetDir,
      locale,
      includeDocs,
      manifest.manifestVersion
    );
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

  for (const toolId of tools) {
    const adapter = manifest.adapters[toolId];
    if (!adapter || adapter.files.length === 0) continue;

    const adapterResult = await copyAdapter(
      targetDir,
      toolId,
      adapter.files,
      { dryRun }
    );
    printCopyResult(`Adaptador: ${adapter.label}`, adapterResult, dryRun);
  }

  if (!dryRun) {
    await writeProjectVersion(
      targetDir,
      getCliVersion(),
      manifest.manifestVersion
    );
    await writeProjectTools(targetDir, tools, manifest.manifestVersion);
  }
}
