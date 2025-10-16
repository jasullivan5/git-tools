import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("./infrastructure/git-hub.js", async () => {
  const fake = await import("../../../test/fake-git-hub.js");
  return {
    createRepo: fake.createRepo,
    deleteRepo: fake.deleteRepo,
  };
});
import { handleCreateRepo } from "./handler.js";
import { createSandbox, type Sandbox } from "../../../test/sandbox.js";
import path from "node:path";
import { existsSync } from "fs-extra";
import { ENV } from "../../environment.js";

describe("Given a directory path, when a request is made to create a new repo", () => {
  let sandbox: Sandbox;
  const newRepoPath = "./new-repo";
  const owner = ENV.REPO_OWNER;
  beforeAll(async () => {
    sandbox = await createSandbox();
    await sandbox.within(async () => {
      await handleCreateRepo(owner, newRepoPath);
    });
  });

  afterAll(async () => {
    await sandbox.cleanup();
  });

  it("creates a directory for the new repo if one doesn't exist", () => {
    const absPath = path.resolve(sandbox.root, newRepoPath);
    console.log(absPath);
    const exists = existsSync(absPath);
    expect(exists).toBe(true);
  });
});
