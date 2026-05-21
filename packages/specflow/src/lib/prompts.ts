import { confirm, checkbox, select } from "@inquirer/prompts";
import fs from "fs-extra";
import path from "node:path";
import { loadManifest, getStableAdapterIds } from "./manifest.js";
import { detectLegacyTools } from "./tools-config.js";

export interface InitAnswers {
  targetDir: string;
  tools: string[];
  includeDocs: boolean;
}

export async function runInitPrompts(
  targetDir: string,
  options: { yes?: boolean }
): Promise<InitAnswers> {
  const manifest = await loadManifest();

  if (options.yes) {
    return {
      targetDir,
      tools: getStableAdapterIds(manifest),
      includeDocs: true,
    };
  }

  console.log("\n  SpecFlow — instalación interactiva\n");

  const proceed = await confirm({
    message: `¿Instalar en ${targetDir}?`,
    default: true,
  });
  if (!proceed) {
    throw new Error("Instalación cancelada.");
  }

  const legacy = await detectLegacyTools(targetDir);
  const defaultChecked = new Set(
    legacy.length > 0 ? legacy : getStableAdapterIds(manifest)
  );

  const choices = Object.entries(manifest.adapters).map(([id, adapter]) => ({
    name:
      adapter.tier === "experimental"
        ? `${adapter.label} [experimental]`
        : adapter.label,
    value: id,
    checked: defaultChecked.has(id),
  }));

  const selectedTools = await checkbox({
    message:
      "Herramientas de IA (espacio para marcar, Enter para confirmar)",
    choices,
  });

  const coreOnly = await confirm({
    message: "¿Solo core (AGENTS.md + .agents) sin adaptadores de IDE?",
    default: false,
  });

  let tools = coreOnly ? [] : selectedTools;

  if (tools.length === 0 && !coreOnly) {
    const onlyCore = await confirm({
      message: "No seleccionaste herramientas. ¿Continuar solo con core?",
      default: true,
    });
    if (!onlyCore) throw new Error("Instalación cancelada.");
    tools = [];
  }

  const hasExperimental = tools.some(
    (id) => manifest.adapters[id]?.tier === "experimental"
  );
  const hasStable = tools.some(
    (id) => manifest.adapters[id]?.tier === "stable"
  );

  if (hasExperimental && !hasStable && tools.length > 0) {
    const ok = await confirm({
      message:
        "Solo elegiste herramientas [experimental]. ¿Continuar igual?",
      default: false,
    });
    if (!ok) throw new Error("Instalación cancelada.");
  }

  if (tools.includes("claude-code")) {
    const claudePath = path.join(targetDir, "CLAUDE.md");
    if (await fs.pathExists(claudePath)) {
      const ok = await confirm({
        message:
          "Ya existe CLAUDE.md. SpecFlow lo sobrescribirá al sincronizar. ¿Continuar?",
        default: false,
      });
      if (!ok) {
        tools = tools.filter((t) => t !== "claude-code");
      }
    }
  }

  const docsChoice = await select({
    message: "Documentación del proyecto (.agents-docs/)",
    choices: [
      { name: "Crear plantillas (recomendado)", value: "yes" as const },
      { name: "Omitir por ahora", value: "no" as const },
    ],
    default: "yes",
  });

  console.log("\n  Resumen:");
  console.log(`    Directorio: ${targetDir}`);
  console.log(
    `    Adaptadores: ${
      tools.length
        ? tools
            .map((id) => manifest.adapters[id]?.label ?? id)
            .join(", ")
        : "(solo core — Codex/Copilot vía AGENTS.md)"
    }`
  );
  console.log(`    Docs: ${docsChoice === "yes" ? "sí" : "no"}`);

  const confirmInstall = await confirm({
    message: "¿Proceder con la instalación?",
    default: true,
  });
  if (!confirmInstall) throw new Error("Instalación cancelada.");

  return {
    targetDir,
    tools,
    includeDocs: docsChoice === "yes",
  };
}

export async function runToolsAddPrompts(
  targetDir: string,
  installed: string[]
): Promise<string[]> {
  const manifest = await loadManifest();
  const available = Object.entries(manifest.adapters)
    .filter(([id]) => !installed.includes(id))
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

  return checkbox({
    message: "¿Qué adaptadores agregar?",
    choices: available,
  });
}

export async function runToolsRemovePrompts(
  installed: string[]
): Promise<string[]> {
  const manifest = await loadManifest();

  return checkbox({
    message: "¿Qué adaptadores quitar?",
    choices: installed.map((id) => ({
      name: manifest.adapters[id]?.label ?? id,
      value: id,
    })),
  });
}
