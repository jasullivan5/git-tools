import type { Command } from "commander";
import pc from "picocolors";
import path from "node:path";
import { handleCreateRepo } from "../handler.js";
import { ENV } from "../../../environment.js";

export function registerCreate(program: Command) {
  const owner = ENV.REPO_OWNER;
  const destinationDirectory = ENV.DESTINATION_DIR;
  const baseUrl = ENV.REMOTE_BASE_URL;
  const visibility = ENV.REPO_VISIBILITY;
  const create = program
    .command("create")
    .description("Create resources (repos, etc.)");

  create
    .command("repo")
    .description("Create and clone <owner>/<name> into your local repos folder")
    .argument("<name>", "repository name (e.g. my-new-repo)")
    .action(async (name: string) => {
      const repo = await handleCreateRepo(
        owner,
        path.resolve(destinationDirectory, name),
        { baseUrl, visibility },
      );
      console.log(pc.green(`✓ Repo ready in ${pc.bold(repo.directory)}`));
    });
}
