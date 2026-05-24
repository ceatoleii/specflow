import { SpecflowCliError } from "../errors.js";
import { readProjectVersion } from "./version.js";

export const NOT_INSTALLED_MESSAGE =
  "SpecFlow no está instalado. Ejecuta: specflow init";

export async function assertProjectInstalled(targetDir: string): Promise<void> {
  const version = await readProjectVersion(targetDir);
  if (!version) {
    throw new SpecflowCliError("NOT_INSTALLED", NOT_INSTALLED_MESSAGE);
  }
}
