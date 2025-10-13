import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createRepo } from "./handler.js";
import { createSandbox, type Sandbox } from "../../../test/sandbox.js";
import path from "node:path";
import { existsSync } from "node:fs";

describe("Given a directory path, when a request is made to create a new repo", () => {
  let sandbox: Sandbox;
  const newRepoPath = "./new-repo";
  beforeAll(async () => {
    sandbox = await createSandbox("temp-root-");
    await sandbox.within(async () => {
      await createRepo(newRepoPath);
    });
  });

  afterAll(async () => {
    await sandbox.cleanup();
  });

  it("creates a directory for the new repo if one doesn't exist", () => {
    const absPath = path.join(sandbox.root, newRepoPath);
    console.log(absPath);
    const exists = existsSync(absPath);
    expect(exists).toBe(true);
  });
});
