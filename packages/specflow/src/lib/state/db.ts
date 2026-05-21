import Database from "better-sqlite3";
import fs from "fs-extra";
import path from "node:path";
import { SpecflowCliError } from "../../errors.js";
import { resolveStateDbPath, STATE_DIR } from "../paths.js";
import { DDL_V1, FTS_TRIGGERS, SCHEMA_VERSION } from "./schema.js";

export type StateDatabase = Database.Database;

export function getMeta(db: StateDatabase, key: string): string | undefined {
  const row = db
    .prepare("SELECT value FROM _meta WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value;
}

export function setMeta(db: StateDatabase, key: string, value: string): void {
  db.prepare(
    "INSERT INTO _meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

function applySchema(db: StateDatabase): void {
  db.exec(DDL_V1);
  db.exec(FTS_TRIGGERS);
  setMeta(db, "schema_version", SCHEMA_VERSION);
}

export interface OpenDatabaseOptions {
  memory?: boolean;
  readonly?: boolean;
}

export function ensureStateDirSync(targetDir: string): void {
  fs.ensureDirSync(path.join(targetDir, STATE_DIR));
}

export function openDatabase(
  targetDir: string,
  options: OpenDatabaseOptions = {}
): StateDatabase {
  let dbPath: string;

  if (options.memory) {
    dbPath = ":memory:";
  } else {
    ensureStateDirSync(targetDir);
    dbPath = resolveStateDbPath(targetDir);
  }

  const db = new Database(dbPath, {
    readonly: options.readonly ?? false,
  });
  db.pragma("journal_mode = WAL");

  const hasMeta = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='_meta'"
    )
    .get();

  if (!hasMeta) {
    applySchema(db);
  } else {
    const version = getMeta(db, "schema_version");
    if (!version) {
      applySchema(db);
    } else if (version !== SCHEMA_VERSION) {
    db.close();
      throw new SpecflowCliError(
        "SCHEMA_MISMATCH",
        `Unsupported state.db schema version: ${version}. Expected ${SCHEMA_VERSION}.`
      );
    }
  }

  return db;
}

export function stateDbExists(targetDir: string): boolean {
  return fs.existsSync(resolveStateDbPath(targetDir));
}

export function withStateDb<T>(
  targetDir: string,
  fn: (db: StateDatabase) => T,
  options: OpenDatabaseOptions = {}
): T {
  const db = openDatabase(targetDir, options);
  try {
    return fn(db);
  } finally {
    db.close();
  }
}

export async function withStateDbAsync<T>(
  targetDir: string,
  fn: (db: StateDatabase) => Promise<T>,
  options: OpenDatabaseOptions = {}
): Promise<T> {
  const db = openDatabase(targetDir, options);
  try {
    return await fn(db);
  } finally {
    db.close();
  }
}
