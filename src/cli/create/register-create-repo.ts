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
      const repo = await createRepo(
        ENV.REPO_OWNER,
        path.resolve(ENV.DESTINATION_DIR, name),
        ENV.REPO_VISIBILITY,
        ENV.REMOTE_BASE_URL,
      );
      console.log(pc.green(`✓ Repo ready in ${pc.bold(repo.directory)}`));

      const { openInVsCode } = await inquirer.prompt([
        {
          type: "confirm",
          name: "openInVsCode",
          message: "Open in VS Code?",
          default: true,
        },
      ]);

      if (openInVsCode) {
        const subprocess = execa("code", [repo.directory], {
          detached: true,
          stdio: "ignore",
        });
        subprocess.unref();
        console.log(pc.cyan("Opening in VS Code..."));
      }
    });
}
