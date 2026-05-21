export type Locale = "es" | "en";

export interface I18nMessages {
  introSubtitle: string;
  languagePrompt: string;
  languageEs: string;
  languageEn: string;
  confirmDirectory: (dir: string) => string;
  alreadyInstalled: (version: string) => string;
  toolsPrompt: string;
  toolsHint: string;
  coreOnlyPrompt: string;
  noToolsSelected: string;
  experimentalOnly: string;
  claudeOverwrite: string;
  docsPrompt: string;
  docsYes: string;
  docsNo: string;
  summaryTitle: string;
  summaryDirectory: string;
  summaryAdapters: string;
  summaryAdaptersCoreOnly: string;
  summaryDocs: string;
  summaryDocsYes: string;
  summaryDocsNo: string;
  stateDbPrompt: string;
  stateDbHint: string;
  summaryStateDb: string;
  summaryStateDbYes: string;
  summaryStateDbNo: string;
  confirmInstall: string;
  cancelled: string;
  installing: (version: string, dir: string) => string;
  dryRunDone: string;
  installDone: (version: string) => string;
  adaptersLine: (tools: string) => string;
  editDocs: string;
  activateFlow: string;
  initRequiresTty: string;
}

const es: I18nMessages = {
  introSubtitle: "Flujo multi-agente spec-driven para herramientas de IA",
  languagePrompt: "¿En qué idioma preferís la configuración?",
  languageEs: "Español",
  languageEn: "English",
  confirmDirectory: (dir) => `¿Instalar SpecFlow en ${dir}?`,
  alreadyInstalled: (version) =>
    `SpecFlow ya está instalado (v${version}). Podés usar \`specflow sync\` o \`specflow tools add\`.`,
  toolsPrompt: "¿Qué herramientas de IA usás?",
  toolsHint: "Espacio para marcar/desmarcar, Enter para confirmar",
  coreOnlyPrompt: "¿Solo core (AGENTS.md + .agents) sin adaptadores de IDE?",
  noToolsSelected:
    "No seleccionaste herramientas. ¿Continuar solo con core (Codex/Copilot vía AGENTS.md)?",
  experimentalOnly:
    "Solo elegiste herramientas [experimental]. ¿Continuar igual?",
  claudeOverwrite:
    "Ya existe CLAUDE.md. SpecFlow lo sobrescribirá al sincronizar. ¿Continuar con Claude Code?",
  docsPrompt: "Documentación del proyecto (.agents-docs/)",
  docsYes: "Crear plantillas (recomendado)",
  docsNo: "Omitir por ahora",
  summaryTitle: "Resumen de instalación",
  summaryDirectory: "Directorio",
  summaryAdapters: "Adaptadores",
  summaryAdaptersCoreOnly: "(solo core — Codex/Copilot vía AGENTS.md)",
  summaryDocs: "Docs",
  summaryDocsYes: "sí",
  summaryDocsNo: "no",
  stateDbPrompt: "¿Usar base de datos local (state.db) para el flujo?",
  stateDbHint:
    "Menos tokens: los agentes consultan slices vía CLI en lugar de releer markdown enteros.",
  summaryStateDb: "State DB",
  summaryStateDbYes: "sí (state.db)",
  summaryStateDbNo: "no (solo markdown)",
  confirmInstall: "¿Proceder con la instalación?",
  cancelled: "Instalación cancelada.",
  installing: (version, dir) => `Instalando SpecFlow v${version} en ${dir}`,
  dryRunDone: "[dry-run] Sin cambios escritos.",
  installDone: (version) => `SpecFlow v${version} instalado.`,
  adaptersLine: (tools) => `Adaptadores: ${tools}`,
  editDocs: "Edita .agents-docs/ cuando quieras.",
  activateFlow: 'Activa el flujo: "nueva tarea: [tu requerimiento]"',
  initRequiresTty:
    "specflow init requiere una terminal interactiva. Ejecutá el comando en tu terminal.",
};

const en: I18nMessages = {
  introSubtitle: "Spec-driven multi-agent workflow for AI coding tools",
  languagePrompt: "Which language do you prefer for setup?",
  languageEs: "Español",
  languageEn: "English",
  confirmDirectory: (dir) => `Install SpecFlow in ${dir}?`,
  alreadyInstalled: (version) =>
    `SpecFlow is already installed (v${version}). Use \`specflow sync\` or \`specflow tools add\`.`,
  toolsPrompt: "Which AI tools do you use?",
  toolsHint: "Space to toggle, Enter to confirm",
  coreOnlyPrompt: "Core only (AGENTS.md + .agents) without IDE adapters?",
  noToolsSelected:
    "No tools selected. Continue with core only (Codex/Copilot via AGENTS.md)?",
  experimentalOnly:
    "You only selected [experimental] tools. Continue anyway?",
  claudeOverwrite:
    "CLAUDE.md already exists. SpecFlow will overwrite it on sync. Continue with Claude Code?",
  docsPrompt: "Project documentation (.agents-docs/)",
  docsYes: "Create templates (recommended)",
  docsNo: "Skip for now",
  summaryTitle: "Installation summary",
  summaryDirectory: "Directory",
  summaryAdapters: "Adapters",
  summaryAdaptersCoreOnly: "(core only — Codex/Copilot via AGENTS.md)",
  summaryDocs: "Docs",
  summaryDocsYes: "yes",
  summaryDocsNo: "no",
  stateDbPrompt: "Use local database (state.db) for flow state?",
  stateDbHint:
    "Fewer tokens: agents query slices via CLI instead of re-reading full markdown files.",
  summaryStateDb: "State DB",
  summaryStateDbYes: "yes (state.db)",
  summaryStateDbNo: "no (markdown only)",
  confirmInstall: "Proceed with installation?",
  cancelled: "Installation cancelled.",
  installing: (version, dir) => `Installing SpecFlow v${version} in ${dir}`,
  dryRunDone: "[dry-run] No files written.",
  installDone: (version) => `SpecFlow v${version} installed.`,
  adaptersLine: (tools) => `Adapters: ${tools}`,
  editDocs: "Edit .agents-docs/ when ready.",
  activateFlow: 'Start the flow: "new task: [your requirement]"',
  initRequiresTty:
    "specflow init requires an interactive terminal. Run the command in your terminal.",
};

const catalogs: Record<Locale, I18nMessages> = { es, en };

export function t(locale: Locale): I18nMessages {
  return catalogs[locale];
}

export function tPreLocale(key: "initRequiresTty"): string {
  return en[key];
}
