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
import type { Repo } from "../../domain/repo.js";

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

      if (!(await confirmCreate(name, repoPath))) {
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

      if (await confirmOpenInVsCode()) {
        await openInVsCode(repo);
        console.log(pc.cyan("Opening in VS Code..."));
      }
    });
}

async function confirmCreate(name: string, repoPath: string): Promise<boolean> {
  console.log(pc.cyan(`Repository name: ${pc.bold(name)}`));
  console.log(pc.cyan(`Destination: ${pc.bold(repoPath)}`));
  console.log(pc.cyan(`Visibility: ${pc.bold(ENV.REPO_VISIBILITY)}`));

  const { confirmCreate } = await inquirer.prompt<{ confirmCreate: boolean }>([
    {
      type: "confirm",
      name: "confirmCreate",
      message: "Create this repository?",
      default: true,
    },
  ]);
  return confirmCreate;
}

async function confirmOpenInVsCode(): Promise<boolean> {
  const { openInVsCode } = await inquirer.prompt<{ openInVsCode: boolean }>([
    {
      type: "confirm",
      name: "openInVsCode",
      message: "Open in VS Code?",
      default: true,
    },
  ]);
  return openInVsCode;
}

async function openInVsCode(repo: Repo) {
  const subprocess = execa("code", [repo.directory], {
    detached: true,
    stdio: "ignore",
  });
  subprocess.unref();
}
