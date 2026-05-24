import { afterAll, afterEach, beforeAll } from "vitest";
import {
  cleanupTmp,
  drainActiveProjects,
  TMP_ROOT,
} from "./src/test/helpers.js";
import fs from "fs-extra";

beforeAll(async () => {
  await fs.ensureDir(TMP_ROOT);
});

afterEach(async () => {
  await drainActiveProjects();
});

afterAll(async () => {
  await cleanupTmp();
});
