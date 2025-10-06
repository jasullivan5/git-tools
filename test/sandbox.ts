// This helper creates a temporary, isolated directory for filesystem tests.
// It ensures each test run operates in its own safe workspace and cleans up afterward.

import { mkdtemp, rm } from "node:fs/promises"; // mkdtemp creates a unique temp dir; rm removes it recursively.
import { tmpdir } from "node:os"; // Provides the OS-specific temporary directory (e.g., /tmp on mac/linux).
import path from "node:path"; // Ensures cross-platform path joining (handles slashes automatically).

// A lightweight interface describing what our sandbox returns.
export interface Sandbox {
  // Absolute path to the temporary root directory.
  root: string;
  // Function to delete the sandbox and restore original state.
  cleanup: () => Promise<void>;
  // Helper that temporarily changes the current working directory to the sandbox,
  // runs a callback, and then returns to the original directory.
  within<T>(function_: (root: string) => Promise<T> | T): Promise<T>;
}

/**
 * Creates a new temporary sandbox directory for tests.
 *
 * Each sandbox:
 *   - Lives under the system temp directory (e.g., /tmp/git-tools-xyz123)
 *   - Is automatically unique per test run
 *   - Provides a `within()` method to run code inside it
 *   - Provides a `cleanup()` method to remove it when finished
 *
 * This allows tests to safely create and delete real files/directories without
 * touching the project repo or home directory — perfect for CI environments.
 */
export async function createSandbox(prefix = "git-tools-"): Promise<Sandbox> {
  // Create a unique temporary directory under the system temp folder.
  // mkdtemp automatically appends random characters to ensure uniqueness.
  const root = await mkdtemp(path.join(tmpdir(), prefix));

  // Save the current working directory so we can restore it later.
  const origCwd = process.cwd();

  /**
   * Removes the sandbox directory and restores the original working directory.
   * Always call this in `afterAll` or `finally` to avoid leaving temp files behind.
   */
  async function cleanup() {
    try {
      // Try to switch back to the original working directory.
      process.chdir(origCwd);
    } catch {
      // Even if this fails (rarely, if cwd was deleted), we still proceed to remove the sandbox.
    }

    // Recursively delete the temporary directory and all its contents.
    // The `force: true` flag ensures no errors if it's already gone.
    await rm(root, { recursive: true, force: true });
  }

  /**
   * Runs a callback within the sandbox directory, temporarily changing cwd.
   * Useful for commands that depend on relative paths (like git init).
   *
   * Automatically restores cwd when done, even if the callback throws.
   */
  async function within<T>(
    function_: (root: string) => Promise<T> | T,
  ): Promise<T> {
    // Switch current working directory to the sandbox.
    process.chdir(root);
    try {
      // Run the provided callback inside the sandbox.
      return await function_(root);
    } finally {
      // Restore the original working directory no matter what happens.
      process.chdir(origCwd);
    }
  }

  // Return the sandbox API: root path, cleanup, and within.
  return { root, cleanup, within };
}
