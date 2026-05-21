import semver from "semver";
import { SpecflowCliError } from "../errors.js";
import { syncCoreAndAdapters } from "../lib/install.js";
import { confirmIfFlowActive } from "../lib/flow.js";
import { resolveTargetDir } from "../lib/paths.js";
import {
  readProjectTools,
  detectLegacyTools,
  writeProjectTools,
} from "../lib/tools-config.js";
import {
  getCliVersion,
  readProjectVersion,
  writeProjectVersion,
} from "../lib/version.js";
import { loadManifest } from "../lib/manifest.js";

export interface SyncOptions {
  cwd?: string;
  dryRun?: boolean;
  yes?: boolean;
}

async function resolveInstalledTools(targetDir: string): Promise<string[]> {
  const config = await readProjectTools(targetDir);
  if (config?.tools.length) return config.tools;
  const legacy = await detectLegacyTools(targetDir);
  if (legacy.length) return legacy;
  return [];
}

export async function runSync(options: SyncOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const cliVersion = getCliVersion();
  const dryRun = options.dryRun ?? false;

  const installed = await readProjectVersion(targetDir);
  if (!installed) {
    throw new SpecflowCliError(
      "NOT_INSTALLED",
      "SpecFlow no está instalado. Ejecuta: specflow init"
    );
  }

  const canProceed = await confirmIfFlowActive(targetDir, options.yes ?? false);
  if (!canProceed) {
    throw new SpecflowCliError(
      "FLOW_ACTIVE",
      "Abortado. Usa --yes para sincronizar con tarea activa."
    );
  }

  const tools = await resolveInstalledTools(targetDir);

  if (semver.major(cliVersion) > semver.major(installed.specflow)) {
    console.warn(
      `\n⚠ Actualización MAJOR: ${installed.specflow} → ${cliVersion}`
    );
    console.warn("  Revisa CHANGELOG antes de continuar.");
  } else if (semver.lt(installed.specflow, cliVersion)) {
    console.log(`\n→ Sincronizando ${installed.specflow} → ${cliVersion}`);
  } else {
    console.log(`\n→ SpecFlow v${cliVersion} (motor al día)`);
  }

  console.log(`  Directorio: ${targetDir}`);
  console.log(
    `  Adaptadores: ${tools.length ? tools.join(", ") : "(solo core)"}`
  );
  console.log("  .agents-docs/ no se modificará.");

  await syncCoreAndAdapters(targetDir, tools, dryRun);

  if (!dryRun) {
    const manifest = await loadManifest();
    await writeProjectTools(targetDir, tools, manifest.manifestVersion);
    await writeProjectVersion(targetDir, cliVersion, manifest.manifestVersion);
    console.log(`\n✓ Sincronizado a SpecFlow v${cliVersion}`);
  } else {
    console.log("\n[dry-run] Sin cambios escritos.");
  }
}
