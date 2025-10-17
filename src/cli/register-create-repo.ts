import type { Command } from "commander";
import pc from "picocolors";
import path from "node:path";
import { ENV } from "./environment.js";
import {
  makeCreateRepoHandler,
  type Git,
  type GitHost,
} from "../operations/create-repo/handler.js";
import { createGit } from "../infrastructure/git.js";
import { createGitHub } from "../infrastructure/git-hub.js";

export function registerCreate(program: Command) {
  const git: Git = createGit();
  const gitHub: GitHost = createGitHub();
  const createRepo = makeCreateRepoHandler(git, gitHub);
  const create = program
    .command("create")
    .description("Create resources (repos, etc.)");

  create
    .command("repo")
    .description("Create and clone <owner>/<name> into your local repos folder")
    .argument("<name>", "repository name (e.g. my-new-repo)")
    .action(async (name: string) => {
      const repo = await createRepo(
        ENV.REPO_OWNER,
        path.resolve(ENV.DESTINATION_DIR, name),
        ENV.REPO_VISIBILITY,
        ENV.REMOTE_BASE_URL,
      );
      console.log(pc.green(`✓ Repo ready in ${pc.bold(repo.directory)}`));
    });
}
