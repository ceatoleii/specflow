import fs from "fs-extra";
import path from "node:path";
import { glob } from "glob";
import { getAssetsDir } from "./paths.js";
import type { SpecflowManifest } from "./manifest.js";

export interface CopyResult {
  created: string[];
  updated: string[];
  skipped: string[];
}

async function expandPatterns(
  baseDir: string,
  patterns: string[]
): Promise<string[]> {
  const files = new Set<string>();
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: baseDir,
      dot: true,
      nodir: true,
      absolute: false,
      ignore: ["**/.DS_Store"],
    });
    for (const m of matches) files.add(m);
  }
  return [...files].sort();
}

export async function copyFiles(
  targetDir: string,
  patterns: string[],
  options: { overwrite: boolean; dryRun: boolean }
): Promise<CopyResult> {
  const assetsDir = getAssetsDir();
  const relativePaths = await expandPatterns(assetsDir, patterns);
  const result: CopyResult = { created: [], updated: [], skipped: [] };

  for (const rel of relativePaths) {
    const src = path.join(assetsDir, rel);
    const dest = path.join(targetDir, rel);

    if (!(await fs.pathExists(src))) continue;

    const destExists = await fs.pathExists(dest);

    if (destExists && !options.overwrite) {
      result.skipped.push(rel);
      continue;
    }

    if (options.dryRun) {
      if (destExists) result.updated.push(rel);
      else result.created.push(rel);
      continue;
    }

    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest, { overwrite: true });

    if (destExists && options.overwrite) result.updated.push(rel);
    else result.created.push(rel);
  }

  return result;
}

export async function copyStatic(
  targetDir: string,
  manifest: SpecflowManifest,
  options: { dryRun: boolean }
): Promise<CopyResult> {
  return copyFiles(targetDir, manifest.static, {
    overwrite: true,
    dryRun: options.dryRun,
  });
}

export async function copyScaffold(
  targetDir: string,
  manifest: SpecflowManifest,
  options: { dryRun: boolean }
): Promise<CopyResult> {
  return copyFiles(targetDir, manifest.scaffold, {
    overwrite: false,
    dryRun: options.dryRun,
  });
}

export function mergeResults(...results: CopyResult[]): CopyResult {
  return {
    created: results.flatMap((r) => r.created),
    updated: results.flatMap((r) => r.updated),
    skipped: results.flatMap((r) => r.skipped),
  };
}

export function printCopyResult(
  label: string,
  result: CopyResult,
  dryRun: boolean
): void {
  const prefix = dryRun ? "[dry-run] " : "";
  console.log(`\n${prefix}${label}`);

  if (result.created.length) {
    console.log("  Created:");
    for (const f of result.created) console.log(`    + ${f}`);
  }
  if (result.updated.length) {
    console.log("  Updated:");
    for (const f of result.updated) console.log(`    ~ ${f}`);
  }
  if (result.skipped.length) {
    console.log("  Skipped (already exists):");
    for (const f of result.skipped) console.log(`    = ${f}`);
  }
  if (
    !result.created.length &&
    !result.updated.length &&
    !result.skipped.length
  ) {
    console.log("  (no changes)");
  }
}
