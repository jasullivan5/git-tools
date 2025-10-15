import type { Command } from "commander";
import pc from "picocolors";
import path from "node:path";
import { createRepo } from "../handler.js";

const owner = "jasullivan5-org";
const destinationDirectory = "/c/Users/jasul/repos";

export function registerCreate(program: Command) {
  const create = program
    .command("create")
    .description("Create resources (repos, etc.)");

  create
    .command("repo")
    .description(
      "Create and clone jasullivan5-org/<name> into your local repos folder",
    )
    .argument("<name>", "repository name (e.g. my-new-repo)")
    .action(async (name: string) => {
      const repo = await createRepo(
        owner,
        path.join(destinationDirectory, name),
      );
      console.log(pc.green(`✓ Repo ready in ${pc.bold(repo.directory)}`));
    });
}
