import { Command } from "commander";
import { registerCreate } from "./create/register-create.js";
import { ensureConfigInteractive } from "./config.js";

function buildProgram() {
  const program = new Command()
    .name("wcp") // set explicitly; don't rely on argv-derived script name
    .description("Workflow Compliance Platform")
    .version(process.env["npm_package_version"] ?? "0.0.0")
    .showHelpAfterError("(add --help for usage)")
    .configureHelp({ sortSubcommands: true, sortOptions: true });

  registerCreate(program);

  program.hook("preAction", async () => {
    await ensureConfigInteractive();
  });

  return program;
}

export async function run() {
  await buildProgram().parseAsync();
}
