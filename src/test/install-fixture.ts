import { installCoreAndAdapters } from "../lib/install.js";
import { loadManifest, getStableAdapterIds } from "../lib/manifest.js";
import type { Locale } from "../lib/i18n.js";

export interface InstallTestProjectOptions {
  tools?: string[];
  includeDocs?: boolean;
  locale?: Locale;
  dryRun?: boolean;
}

export async function installTestProject(
  dir: string,
  options: InstallTestProjectOptions = {}
): Promise<void> {
  const manifest = await loadManifest();
  await installCoreAndAdapters({
    targetDir: dir,
    tools: options.tools ?? getStableAdapterIds(manifest),
    includeDocs: options.includeDocs ?? true,
    dryRun: options.dryRun ?? false,
    locale: options.locale ?? "en",
  });
}
