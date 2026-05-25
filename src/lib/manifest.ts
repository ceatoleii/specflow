import fs from "fs-extra";
import path from "node:path";
import { getPackageRoot } from "./paths.js";

export type AdapterTier = "stable" | "experimental";

export interface AdapterDefinition {
  tier: AdapterTier;
  label: string;
  files: string[];
}

export interface SpecflowManifestV2 {
  manifestVersion: number;
  core: {
    static: string[];
    scaffold: string[];
  };
  adapters: Record<string, AdapterDefinition>;
  neverTouch: string[];
  gitignoreEntries: string[];
}

export async function loadManifest(): Promise<SpecflowManifestV2> {
  const manifestPath = path.join(getPackageRoot(), "manifest.json");
  const raw = await fs.readJson(manifestPath);
  if (raw.manifestVersion !== 2) {
    throw new Error(
      `Unsupported manifest version: ${raw.manifestVersion}. Update @ceatoleii/specflow.`
    );
  }
  return raw as SpecflowManifestV2;
}

export function getAdapterIds(manifest: SpecflowManifestV2): string[] {
  return Object.keys(manifest.adapters);
}

export function getStableAdapterIds(manifest: SpecflowManifestV2): string[] {
  return getAdapterIds(manifest).filter(
    (id) => manifest.adapters[id].tier === "stable"
  );
}

/** Adapters offered during `specflow init` (v2.2+: Cursor only). */
export function getInitAdapterIds(_manifest: SpecflowManifestV2): string[] {
  return ["cursor"];
}
