import { describe, it, expect } from "vitest";
import { withStateDb } from "./db.js";
import { createProjectDir } from "../../test/helpers.js";
import { writeProjectConfig } from "../project-config.js";

describe("withStateDb", () => {
  it("closes the database after success", async () => {
    const dir = await createProjectDir("with-state-db-success");
    await writeProjectConfig(dir, {
      locale: "es",
      includeDocs: false,
      stateDb: true,
      manifestVersion: 2,
    });

    const sessionId = withStateDb(dir, (db) => {
      const row = db.prepare("SELECT 1 as ok").get() as { ok: number };
      expect(row.ok).toBe(1);
      return "done";
    });

    expect(sessionId).toBe("done");
  });

  it("closes the database when fn throws", async () => {
    const dir = await createProjectDir("with-state-db-error");
    await writeProjectConfig(dir, {
      locale: "es",
      includeDocs: false,
      stateDb: true,
      manifestVersion: 2,
    });

    expect(() =>
      withStateDb(dir, () => {
        throw new Error("boom");
      })
    ).toThrow("boom");
  });
});
