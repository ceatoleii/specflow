import semver from "semver";
import { resolveTargetDir } from "../lib/paths.js";
import { isFlowActive } from "../lib/flow.js";
import { getCliVersion, readProjectVersion } from "../lib/version.js";
import {
  readProjectTools,
  detectLegacyTools,
} from "../lib/tools-config.js";
import { loadManifest } from "../lib/manifest.js";
import { getStateStatusInfo } from "../lib/state/status-info.js";
import { readProjectConfig } from "../lib/project-config.js";

export type StatusResult = "ok" | "not_installed" | "outdated" | "cli_older";

export interface StatusOptions {
  cwd?: string;
}

export async function runStatus(options: StatusOptions): Promise<StatusResult> {
  const targetDir = resolveTargetDir(options.cwd);
  const cliVersion = getCliVersion();
  const manifest = await loadManifest();
  const installed = await readProjectVersion(targetDir);
  const flowActive = await isFlowActive(targetDir);

  console.log(`\nSpecFlow @ceatoleii/specflow`);
  console.log(`  CLI:        v${cliVersion}`);
  console.log(`  Directorio: ${targetDir}`);

  if (!installed) {
    console.log(`  Proyecto:   no instalado`);
    console.log(`\n  Ejecuta: specflow init`);
    return "not_installed";
  }

  console.log(`  Proyecto:   v${installed.specflow}`);

  let toolsConfig = await readProjectTools(targetDir);
  const tools =
    toolsConfig?.tools.length
      ? toolsConfig.tools
      : await detectLegacyTools(targetDir);

  if (tools.length) {
    const labels = tools.map(
      (id) =>
        `${manifest.adapters[id]?.label ?? id} (${
          manifest.adapters[id]?.tier ?? "?"
        })`
    );
    console.log(`  Adaptadores: ${labels.join(", ")}`);
  } else {
    console.log(`  Adaptadores: (solo core — AGENTS.md)`);
  }

  console.log(`  Flujo:      ${flowActive ? "activo" : "inactivo"}`);

  const projectConfig = await readProjectConfig(targetDir);
  if (projectConfig) {
    console.log(
      `  Config:     stateDb=${projectConfig.stateDb ? "on" : "off"}`
    );
  }

  const stateInfo = getStateStatusInfo(targetDir);
  if (stateInfo.hasDb && stateInfo.sessionId) {
    console.log(
      `  State DB:   session ${stateInfo.sessionId}, phase ${stateInfo.phase ?? "(unset)"}, ${stateInfo.taskCount} tasks`
    );
  } else if (stateInfo.hasDb) {
    console.log(`  State DB:   (no active session)`);
  }

  if (semver.lt(installed.specflow, cliVersion)) {
    const diff = semver.diff(installed.specflow, cliVersion) ?? "patch";
    console.log(`\n  Estado: desactualizado (${diff} disponible)`);
    console.log(`  Ejecuta: specflow sync`);
    return "outdated";
  }

  if (semver.gt(installed.specflow, cliVersion)) {
    console.log(`\n  Estado: proyecto más nuevo que el CLI`);
    return "cli_older";
  }

  console.log(`\n  Estado: actualizado ✓`);
  return "ok";
}
