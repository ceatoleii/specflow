import fs from "fs-extra";
import path from "node:path";
import { glob } from "glob";
import { getAssetsDir } from "./paths.js";

export interface CopyResult {
  created: string[];
  updated: string[];
  skipped: string[];
}

async function expandPatterns(
  baseDir: string,
  patterns: string[]
): Promise<string[]> {
  if (patterns.length === 0) return [];
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

function toDestPath(relativePath: string, stripPrefix: string): string {
  if (stripPrefix && relativePath.startsWith(stripPrefix)) {
    return relativePath.slice(stripPrefix.length);
  }
  return relativePath;
}

export async function copyFromPatterns(
  targetDir: string,
  patterns: string[],
  options: { overwrite: boolean; dryRun: boolean; stripPrefix?: string }
): Promise<CopyResult> {
  const assetsDir = getAssetsDir();
  const relativePaths = await expandPatterns(assetsDir, patterns);
  const result: CopyResult = { created: [], updated: [], skipped: [] };
  const stripPrefix = options.stripPrefix ?? "";

  for (const rel of relativePaths) {
    const src = path.join(assetsDir, rel);
    const destRel = toDestPath(rel, stripPrefix);
    const dest = path.join(targetDir, destRel);

    if (!(await fs.pathExists(src))) continue;

    const destExists = await fs.pathExists(dest);

    if (destExists && !options.overwrite) {
      result.skipped.push(destRel);
      continue;
    }

    if (options.dryRun) {
      if (destExists) result.updated.push(destRel);
      else result.created.push(destRel);
      continue;
    }

    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest, { overwrite: true });

    if (destExists && options.overwrite) result.updated.push(destRel);
    else result.created.push(destRel);
  }

  return result;
}

export async function copyCoreStatic(
  targetDir: string,
  patterns: string[],
  options: { dryRun: boolean }
): Promise<CopyResult> {
  return copyFromPatterns(targetDir, patterns, {
    overwrite: true,
    dryRun: options.dryRun,
    stripPrefix: "core/",
  });
}

export async function copyCoreScaffold(
  targetDir: string,
  patterns: string[],
  options: { dryRun: boolean }
): Promise<CopyResult> {
  return copyFromPatterns(targetDir, patterns, {
    overwrite: false,
    dryRun: options.dryRun,
    stripPrefix: "core/",
  });
}

export async function copyAdapter(
  targetDir: string,
  adapterId: string,
  patterns: string[],
  options: { dryRun: boolean }
): Promise<CopyResult> {
  if (patterns.length === 0) {
    return { created: [], updated: [], skipped: [] };
  }
  return copyFromPatterns(targetDir, patterns, {
    overwrite: true,
    dryRun: options.dryRun,
    stripPrefix: `adapters/${adapterId}/`,
  });
}

export async function removeAdapterFiles(
  targetDir: string,
  adapterId: string,
  patterns: string[],
  options: { dryRun: boolean }
): Promise<string[]> {
  const assetsDir = getAssetsDir();
  const relativePaths = await expandPatterns(assetsDir, patterns);
  const removed: string[] = [];

  for (const rel of relativePaths) {
    const destRel = toDestPath(rel, `adapters/${adapterId}/`);
    const dest = path.join(targetDir, destRel);
    if (!(await fs.pathExists(dest))) continue;

    if (!options.dryRun) {
      await fs.remove(dest);
    }
    removed.push(destRel);
  }

  return removed;
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
