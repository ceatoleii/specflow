import { loadManifest } from "../lib/manifest.js";
import {
  copyScaffold,
  copyStatic,
  mergeResults,
  printCopyResult,
} from "../lib/copy.js";
import { ensureGitignoreEntries } from "../lib/gitignore.js";
import { resolveTargetDir } from "../lib/paths.js";
import { getCliVersion, readProjectVersion, writeProjectVersion } from "../lib/version.js";

export interface InitOptions {
  cwd?: string;
  noDocs?: boolean;
  dryRun?: boolean;
}

export async function runInit(options: InitOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const manifest = await loadManifest();
  const cliVersion = getCliVersion();
  const dryRun = options.dryRun ?? false;

  const existing = await readProjectVersion(targetDir);
  if (existing && !dryRun) {
    console.log(
      `SpecFlow ya está instalado (v${existing.specflow}). Usa \`specflow sync\` para actualizar.`
    );
  }

  console.log(`\n→ Instalando SpecFlow v${cliVersion} en ${targetDir}`);

  const staticResult = await copyStatic(targetDir, manifest, { dryRun });
  printCopyResult("Motor (reglas, templates, cursor)", staticResult, dryRun);

  let scaffoldResult = { created: [] as string[], updated: [] as string[], skipped: [] as string[] };
  if (!options.noDocs) {
    scaffoldResult = await copyScaffold(targetDir, manifest, { dryRun });
    printCopyResult("Docs (solo archivos nuevos)", scaffoldResult, dryRun);
  } else {
    console.log("\n  Docs: omitidos (--no-docs)");
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

    await writeProjectVersion(targetDir, cliVersion, manifest.manifestVersion);
  }

  const merged = mergeResults(staticResult, scaffoldResult);

  if (dryRun) {
    console.log("\n[dry-run] Sin cambios escritos.");
    return;
  }

  console.log(`\n✓ SpecFlow v${cliVersion} instalado.`);
  console.log("  Siguiente: edita .agents-docs/ cuando quieras (manual).");
  console.log('  En Cursor: "nueva tarea: [tu requerimiento]"');
}
