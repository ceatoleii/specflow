import semver from "semver";
import { loadManifest } from "../lib/manifest.js";
import { copyStatic, printCopyResult } from "../lib/copy.js";
import { confirmIfFlowActive } from "../lib/flow.js";
import { resolveTargetDir } from "../lib/paths.js";
import {
  getCliVersion,
  readProjectVersion,
  writeProjectVersion,
} from "../lib/version.js";

export interface SyncOptions {
  cwd?: string;
  dryRun?: boolean;
  yes?: boolean;
}

export async function runSync(options: SyncOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const manifest = await loadManifest();
  const cliVersion = getCliVersion();
  const dryRun = options.dryRun ?? false;

  const installed = await readProjectVersion(targetDir);
  if (!installed) {
    console.error(
      "SpecFlow no está instalado en este directorio. Ejecuta: specflow init"
    );
    process.exit(1);
  }

  const canProceed = await confirmIfFlowActive(targetDir, options.yes ?? false);
  if (!canProceed) {
    console.error("\nAbortado. Usa --yes para sincronizar con tarea activa.");
    process.exit(1);
  }

  if (semver.major(cliVersion) > semver.major(installed.specflow)) {
    console.warn(
      `\n⚠ Actualización MAJOR: ${installed.specflow} → ${cliVersion}`
    );
    console.warn("  Revisa CHANGELOG antes de continuar.");
  } else if (semver.lt(installed.specflow, cliVersion)) {
    console.log(`\n→ Sincronizando ${installed.specflow} → ${cliVersion}`);
  } else {
    console.log(`\n→ Ya estás en v${cliVersion} (sin cambios de versión).`);
  }

  console.log(`  Directorio: ${targetDir}`);
  console.log("  .agents-docs/ no se modificará.");

  const staticResult = await copyStatic(targetDir, manifest, { dryRun });
  printCopyResult("Motor actualizado", staticResult, dryRun);

  if (!dryRun) {
    await writeProjectVersion(targetDir, cliVersion, manifest.manifestVersion);
    console.log(`\n✓ Sincronizado a SpecFlow v${cliVersion}`);
  } else {
    console.log("\n[dry-run] Sin cambios escritos.");
  }
}
