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
import { pathToFileURL } from "node:url";

describe("Given a directory path, when a request is made to create a new repo", () => {
  let sandbox: Sandbox;
  const newRepoPath = "./new-repo";
  const owner = "jasullivan5-org";
  beforeAll(async () => {
    sandbox = await createSandbox();
    await sandbox.within(async () => {
      await handleCreateRepo(owner, newRepoPath, {
        baseUrl: pathToFileURL("./.remotes/").href,
      });
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
