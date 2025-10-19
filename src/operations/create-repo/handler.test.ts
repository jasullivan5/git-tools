import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeCreateRepoHandler } from "./handler.js";
import { createSandbox, type Sandbox } from "../../../test/sandbox.js";
import path from "node:path";
import { exists } from "fs-extra";
import { pathToFileURL } from "node:url";
import { createFakeGitHub } from "../../../test/fake-git-hub.js";
import { createGit } from "../../infrastructure/git.js";

describe("Given an owner, directory path, visibility, and remote url, when a request is made to create a new repo", () => {
  let sandbox: Sandbox;
  const newRepoPath = "./new-repo";
  const owner = "jasullivan5-org";
  beforeAll(async () => {
    sandbox = await createSandbox();
    await sandbox.within(async () => {
      const fakeGitHub = createFakeGitHub();
      const git = createGit();
      const createRepo = makeCreateRepoHandler(git, fakeGitHub);
      await createRepo(
        owner,
        newRepoPath,
        "public",
        pathToFileURL("./.remotes/").href,
      );
    });
  });

  afterAll(async () => {
    await sandbox.cleanup();
  });

  it("clones the repo to the given directory", async () => {
    const absPath = path.resolve(sandbox.root, newRepoPath);
    const doesExist = await exists(absPath);
    expect(doesExist).toBe(true);
  });
});
