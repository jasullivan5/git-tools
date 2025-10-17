import { mkdtemp, remove } from "fs-extra";
import { tmpdir } from "node:os";
import path from "node:path";

export async function createSandbox(prefix = "wcp-test-sandbox-") {
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
    process.chdir(_root);

    try {
      return await function_();
    } finally {
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

export type Sandbox = Awaited<ReturnType<typeof createSandbox>>;
