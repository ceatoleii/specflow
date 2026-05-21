import semver from "semver";
import { SpecflowCliError } from "../errors.js";
import { resolveTargetDir } from "../lib/paths.js";
import { isFlowActive } from "../lib/flow.js";
import { getCliVersion, readProjectVersion } from "../lib/version.js";

export type StatusResult = "ok" | "not_installed" | "outdated" | "cli_older";

export interface StatusOptions {
  cwd?: string;
}

export async function runStatus(options: StatusOptions): Promise<StatusResult> {
  const targetDir = resolveTargetDir(options.cwd);
  const cliVersion = getCliVersion();
  const installed = await readProjectVersion(targetDir);
  const flowActive = await isFlowActive(targetDir);

  console.log(`\nSpecFlow @ceatoleii/specflow`);
  console.log(`  CLI:       v${cliVersion}`);
  console.log(`  Directorio: ${targetDir}`);

  if (!installed) {
    console.log(`  Proyecto:  no instalado`);
    console.log(`\n  Ejecuta: specflow init`);
    return "not_installed";
  }

  console.log(`  Proyecto:  v${installed.specflow}`);
  console.log(`  Instalado: ${installed.installedAt}`);
  console.log(`  Flujo:     ${flowActive ? "activo" : "inactivo"}`);

  if (semver.lt(installed.specflow, cliVersion)) {
    const diff = semver.diff(installed.specflow, cliVersion) ?? "patch";
    console.log(`\n  Estado: desactualizado (${diff} disponible)`);
    console.log(`  Ejecuta: specflow sync`);
    return "outdated";
  }

  if (semver.gt(installed.specflow, cliVersion)) {
    console.log(`\n  Estado: proyecto más nuevo que el CLI (actualiza el paquete npm)`);
    return "cli_older";
  }

  console.log(`\n  Estado: actualizado ✓`);
  return "ok";
}
