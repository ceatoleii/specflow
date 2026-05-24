import fs from "fs-extra";
import path from "node:path";
import { FLOW_FLAG } from "./paths.js";

export async function isFlowActive(targetDir: string): Promise<boolean> {
  return fs.pathExists(path.join(targetDir, FLOW_FLAG));
}

export async function confirmIfFlowActive(
  targetDir: string,
  yes: boolean
): Promise<boolean> {
  const active = await isFlowActive(targetDir);
  if (!active) return true;

  if (yes) return true;

  console.warn(
    "\n⚠ SpecFlow tiene una tarea activa (.agents-state/.flow-enabled)."
  );
  console.warn(
    "  sync actualizará reglas pero no toca .agents-state/. Usa --yes para continuar sin prompt."
  );

  return false;
}
