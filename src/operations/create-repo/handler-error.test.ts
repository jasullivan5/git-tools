import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRepo } from "./handler.js";
import { createSandbox, type Sandbox } from "../../../test/sandbox.js";
import { ensureDir, ensureFile } from "fs-extra";

describe("Given a directory path, when a request is made to create a new repo", () => {
  let sandbox: Sandbox;
  beforeEach(async () => {
    sandbox = await createSandbox("temp-root-");
  });
  afterEach(async () => {
    await sandbox.cleanup();
  });

  it("errors if a file with the same path already exists", async () => {
    const newRepoPath = "./new-repo";
    await sandbox.within(async () => {
      await ensureFile(newRepoPath);
    });

    await expect(
      sandbox.within(async () => {
        await createRepo(newRepoPath);
      }),
    ).rejects.toThrow();
  });

  it("errors if the directory isn't empty", async () => {
    const newRepoPath = "./new-repo";
    await sandbox.within(async () => {
      await ensureDir(newRepoPath + "/.git");
    });
    await expect(
      sandbox.within(async () => {
        await createRepo(newRepoPath);
      }),
    ).rejects.toThrow();
  });
});
