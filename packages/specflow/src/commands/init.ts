import { installCoreAndAdapters } from "../lib/install.js";
import { runInitPrompts } from "../lib/prompts.js";
import { resolveTargetDir } from "../lib/paths.js";
import { readProjectVersion, getCliVersion } from "../lib/version.js";

export interface InitOptions {
  cwd?: string;
  yes?: boolean;
  noDocs?: boolean;
  dryRun?: boolean;
}

export async function runInit(options: InitOptions): Promise<void> {
  const targetDir = resolveTargetDir(options.cwd);
  const cliVersion = getCliVersion();
  const dryRun = options.dryRun ?? false;
  const interactive = !options.yes && process.stdin.isTTY;

  const existing = await readProjectVersion(targetDir);
  if (existing && !dryRun && interactive) {
    console.log(
      `\n  SpecFlow ya instalado (v${existing.specflow}). Usa \`specflow sync\` o \`specflow tools add\`.`
    );
  }

  const answers = await runInitPrompts(targetDir, {
    yes: !interactive,
  });

  const tools = answers.tools;
  const includeDocs = options.noDocs ? false : answers.includeDocs;

  console.log(`\n→ Instalando SpecFlow v${cliVersion} en ${targetDir}`);

  await installCoreAndAdapters({
    targetDir,
    tools,
    includeDocs,
    dryRun,
  });

  if (dryRun) {
    console.log("\n[dry-run] Sin cambios escritos.");
    return;
  }

  console.log(`\n✓ SpecFlow v${cliVersion} instalado.`);
  if (tools.length) {
    console.log(`  Adaptadores: ${tools.join(", ")}`);
  }
  console.log("  Edita .agents-docs/ cuando quieras.");
  console.log('  Activa el flujo: "nueva tarea: [tu requerimiento]"');
}
