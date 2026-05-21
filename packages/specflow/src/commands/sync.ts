import semver from "semver";
import { SpecflowCliError } from "../errors.js";
import { syncCoreAndAdapters } from "../lib/install.js";
import { confirmIfFlowActive } from "../lib/flow.js";
import { resolveTargetDir } from "../lib/paths.js";
import { resolveInstalledTools } from "../lib/tools-config.js";
import { assertProjectInstalled } from "../lib/project-guard.js";
import {
  getCliVersion,
  readProjectVersion,
  writeProjectVersion,
} from "../lib/version.js";
import { loadManifest } from "../lib/manifest.js";
import { writeProjectTools } from "../lib/tools-config.js";

export interface SyncOptions {
  cwd?: string;
  dryRun?: boolean;
  yes?: boolean;
}

export async function runSync(options: SyncOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const cliVersion = getCliVersion();
  const dryRun = options.dryRun ?? false;

  await assertProjectInstalled(targetDir);
  const installed = (await readProjectVersion(targetDir))!;

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

    const { readProjectConfig } = await import("../lib/project-config.js");
    const config = await readProjectConfig(targetDir);
    if (config?.stateDb) {
      const { ensureStateForProject } = await import(
        "../lib/state/ensure.js"
      );
      const state = await ensureStateForProject(targetDir);
      if (state.migrated) {
        console.log(
          `\n→ Imported legacy .agents-state/current/ → state.db (session ${state.sessionId})`
        );
      }
    }

    console.log(`\n✓ Sincronizado a SpecFlow v${cliVersion}`);
  } else {
    console.log("\n[dry-run] Sin cambios escritos.");
  }
}
