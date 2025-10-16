import { mkdtemp, remove } from "fs-extra";
import { tmpdir } from "node:os";
import path from "node:path";
import url from "node:url";

export async function createSandbox(prefix = "git-tools-test-sandbox-") {
  const _root = await mkdtemp(path.resolve(tmpdir(), prefix));
  const _origCwd = process.cwd();

  async function cleanup() {
    try {
      process.chdir(_origCwd);
    } catch {
      // Even if this fails (rarely, if cwd was deleted), we still proceed to remove the sandbox.
    }
    await remove(_root);
  }

  async function within<T>(function_: () => Promise<T> | T): Promise<T> {
    const previousCwd = process.cwd();
    const previousGitBase = process.env["REMOTE_BASE_URL"];
    process.chdir(_root);

    const remotesDirectory = path.resolve(_root, ".remotes") + path.sep;
    process.env["REMOTE_BASE_URL"] = url.pathToFileURL(remotesDirectory).href;
    try {
      return await function_();
    } finally {
      process.env["REMOTE_BASE_URL"] = previousGitBase;
      process.chdir(previousCwd);
    }
  }

  return Object.freeze({
    cleanup,
    within,
    get root() {
      return _root;
    },
  });
}

export type Sandbox = ReturnType<typeof createSandbox>;
