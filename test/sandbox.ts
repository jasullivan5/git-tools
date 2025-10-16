import { mkdtemp, remove } from "fs-extra";
import { tmpdir } from "node:os";
import path from "node:path";

export interface Sandbox {
  root: string;
  cleanup: () => Promise<void>;
  within<T>(function_: () => Promise<T> | T): Promise<T>;
}

export async function createSandbox(prefix = "git-tools-"): Promise<Sandbox> {
  const root = await mkdtemp(path.join(tmpdir(), prefix));
  const origCwd = process.cwd();

  async function cleanup() {
    try {
      process.chdir(origCwd);
    } catch {
      // If cwd was deleted, continue to remove the sandbox.
    }
    await remove(root);
  }

  async function within<T>(function_: () => Promise<T> | T): Promise<T> {
    const previousCwd = process.cwd(); // <-- capture parent cwd for nesting
    process.chdir(root);
    try {
      return await function_();
    } finally {
      process.chdir(previousCwd); // <-- restore to parent, not origCwd
    }
  }

  return { root, cleanup, within };
}
