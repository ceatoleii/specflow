import { copyAdapter, removeAdapterFiles, printCopyResult } from "../lib/copy.js";
import { loadManifest } from "../lib/manifest.js";
import {
  readProjectTools,
  writeProjectTools,
  resolveInstalledTools,
} from "../lib/tools-config.js";
import { assertProjectInstalled } from "../lib/project-guard.js";
import { resolveTargetDir } from "../lib/paths.js";
import {
  runToolsAddPrompts,
  runToolsRemovePrompts,
} from "../lib/prompts.js";
import { SpecflowCliError } from "../errors.js";

export interface ToolsOptions {
  cwd?: string;
}

async function ensureInstalledTools(targetDir: string): Promise<string[]> {
  await assertProjectInstalled(targetDir);
  const config = await readProjectTools(targetDir);
  if (config?.tools.length) return config.tools;
  const tools = await resolveInstalledTools(targetDir);
  if (tools.length) {
    await writeProjectTools(targetDir, tools, 2);
  }
  return tools;
}

export async function runToolsList(options: ToolsOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const manifest = await loadManifest();
  const installed = await ensureInstalledTools(targetDir);

  console.log("\n  Adaptadores instalados:");
  if (!installed.length) {
    console.log("    (ninguno — solo core / AGENTS.md)");
    return;
  }

  for (const id of installed) {
    const a = manifest.adapters[id];
    console.log(`    • ${a?.label ?? id} [${a?.tier ?? "?"}]`);
  }

  const all = Object.keys(manifest.adapters);
  const missing = all.filter((id) => !installed.includes(id));
  if (missing.length) {
    console.log("\n  Disponibles para agregar:");
    for (const id of missing) {
      const a = manifest.adapters[id];
      console.log(`    • ${a.label} [${a.tier}]`);
    }
  }
}

export interface ToolsModifyOptions extends ToolsOptions {
  dryRun?: boolean;
  yes?: boolean;
  toolIds?: string[];
}

export async function runToolsAdd(options: ToolsModifyOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const manifest = await loadManifest();
  const installed = await ensureInstalledTools(targetDir);

  let toAdd = options.toolIds ?? [];
  if (!toAdd.length) {
    if (!process.stdin.isTTY && !options.yes) {
      throw new SpecflowCliError(
        "NO_TTY",
        "Usa: specflow tools add en terminal interactivo"
      );
    }
    toAdd = await runToolsAddPrompts(targetDir, installed);
  }

  if (!toAdd.length) return;

  const merged = [...new Set([...installed, ...toAdd])].sort();

  for (const toolId of toAdd) {
    const adapter = manifest.adapters[toolId];
    if (!adapter) continue;
    if (adapter.files.length === 0) {
      console.log(`\n  ${adapter.label}: usa AGENTS.md (sin archivos extra)`);
      continue;
    }
    const result = await copyAdapter(targetDir, toolId, adapter.files, {
      dryRun: options.dryRun ?? false,
    });
    printCopyResult(`Agregado: ${adapter.label}`, result, options.dryRun ?? false);
  }

  if (!options.dryRun) {
    await writeProjectTools(targetDir, merged, manifest.manifestVersion);
    console.log(`\n✓ Adaptadores: ${merged.join(", ")}`);
  }
}

export async function runToolsRemove(
  options: ToolsModifyOptions
): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const manifest = await loadManifest();
  const installed = await ensureInstalledTools(targetDir);

  let toRemove = options.toolIds ?? [];
  if (!toRemove.length) {
    if (!process.stdin.isTTY) {
      throw new SpecflowCliError(
        "NO_TTY",
        "Usa: specflow tools remove en terminal interactivo"
      );
    }
    toRemove = await runToolsRemovePrompts(installed);
  }

  if (!toRemove.length) return;

  for (const toolId of toRemove) {
    const adapter = manifest.adapters[toolId];
    if (!adapter) continue;
    const removed = await removeAdapterFiles(
      targetDir,
      toolId,
      adapter.files,
      { dryRun: options.dryRun ?? false }
    );
    if (removed.length) {
      console.log(`\n  Quitado ${adapter.label}:`);
      for (const f of removed) console.log(`    - ${f}`);
    }
  }

  const merged = installed.filter((id) => !toRemove.includes(id));

  if (!options.dryRun) {
    await writeProjectTools(targetDir, merged, manifest.manifestVersion);
    console.log(
      `\n✓ Adaptadores restantes: ${
        merged.length ? merged.join(", ") : "(solo core)"
      }`
    );
  }
}
