import type { Command } from "commander";
import { registerCreateRepo } from "./register-create-repo.js";

export function registerCreate(program: Command) {
  const create = program
    .command("create")
    .description("Create resources (repos, etc.)");
  registerCreateRepo(create);
}
