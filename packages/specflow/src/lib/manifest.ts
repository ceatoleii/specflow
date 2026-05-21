import fs from "fs-extra";
import path from "node:path";
import { getPackageRoot } from "./paths.js";

export interface SpecflowManifest {
  manifestVersion: number;
  static: string[];
  scaffold: string[];
  neverTouch: string[];
  gitignoreEntries: string[];
}

export async function loadManifest(): Promise<SpecflowManifest> {
  const manifestPath = path.join(getPackageRoot(), "manifest.json");
  return fs.readJson(manifestPath) as Promise<SpecflowManifest>;
}
