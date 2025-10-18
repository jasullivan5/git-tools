import type { Command } from "commander";
import pc from "picocolors";
import path from "node:path";
import { ENV } from "../environment.js";
import {
  makeCreateRepoHandler,
  type Git,
  type GitHost,
} from "../../operations/create-repo/handler.js";
import { createGit } from "../../infrastructure/git.js";
import { createGitHub } from "../../infrastructure/git-hub.js";
import { execa } from "execa";
import inquirer from "inquirer";

export function registerCreateRepo(create: Command) {
  const git: Git = createGit();
  const gitHub: GitHost = createGitHub();
  const createRepo = makeCreateRepoHandler(git, gitHub);

  create
    .command("repo")
    .description("Create and clone <name> into your local repos folder")
    .argument("<name>", "repository name (e.g. my-new-repo)")
    .action(async (name: string) => {
      const repoPath = path.resolve(ENV.DESTINATION_DIR, name);
      printPlan(name, repoPath, ENV.REPO_VISIBILITY);

      if (!(await confirm("Create this repository?"))) {
        console.log(pc.yellow("✗ Cancelled."));
        return;
      }

      const repo = await createRepo(
        ENV.REPO_OWNER,
        repoPath,
        ENV.REPO_VISIBILITY,
        ENV.REMOTE_BASE_URL,
      );
      console.log(pc.green(`✓ Repo ready in ${pc.bold(repo.directory)}`));

      if (await confirm("Open in VS Code?")) {
        try {
          await openInVsCode(repo.directory);
          console.log(pc.cyan("Opening in VS Code..."));
        } catch (err) {
          console.error(pc.red("Failed to open VS Code:"), err);
        }
      }
    });
}

/** Tiny, typed boolean confirm */
async function confirm(message: string, defaultValue = true): Promise<boolean> {
  const { result } = await inquirer.prompt<{ result: boolean }>([
    { type: "confirm", name: "result", message, default: defaultValue },
  ]);
  return result;
}

function printPlan(name: string, repoPath: string, visibility: string) {
  console.log(pc.cyan(`Repository name: ${pc.bold(name)}`));
  console.log(pc.cyan(`Destination: ${pc.bold(repoPath)}`));
  console.log(pc.cyan(`Visibility: ${pc.bold(visibility)}`));
}

/** Spawn VS Code detached so our process can exit immediately */
async function openInVsCode(directory: string): Promise<void> {
  const subprocess = execa("code", [directory], {
    detached: true,
    stdio: "ignore",
  });
  subprocess.unref();
}
