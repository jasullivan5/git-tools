import fs, { exists } from "fs-extra";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import inquirer from "inquirer";
import { repoVisibilities } from "../domain/repo.js";

const CONFIG_PATH = path.join(os.homedir(), "wcp-config.json");
const SCHEMA_PATH = path.join(os.homedir(), "wcp-config.schema.json");

const ConfigSchema = z.object({
  REPO_OWNER: z.string().min(1, "REPO_OWNER is required"),
  DESTINATION_DIR: z
    .string()
    .refine(
      (directory: string) => path.isAbsolute(directory),
      "DESTINATION_DIR must be absolute",
    ),
  REPO_VISIBILITY: z.enum(repoVisibilities),
  REMOTE_BASE_URL: z
    .url()
    .and(
      z
        .string()
        .regex(/\/$/, { message: "REMOTE_BASE_URL must end with a slash" }),
    ),
});

const ConfigFileSchema = ConfigSchema.extend({
  $schema: z.string().optional(),
});

export async function ensureConfigInteractive(): Promise<Config> {
  try {
    return await loadConfig();
  } catch (error) {
    if (await exists(CONFIG_PATH)) throw error; // exists but invalid → surface errors
    // Missing → ask to create
    const { create } = await inquirer.prompt([
      {
        type: "confirm",
        name: "create",
        default: true,
        message: `Config not found at ${CONFIG_PATH}. Create it now?`,
      },
    ]);
    if (!create) {
      throw new Error(
        `Config required. Create ${CONFIG_PATH} or rerun to auto-create.`,
      );
    }

    // Prompts with sane defaults
    const defaults: Config = {
      REPO_OWNER: "",
      DESTINATION_DIR: path.resolve(os.homedir(), "repos"),
      REPO_VISIBILITY: "public",
      REMOTE_BASE_URL: "https://github.com/",
    };

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "REPO_OWNER",
        message: "Repo owner/org",
        validate: makeValidator("REPO_OWNER"),
      },
      {
        type: "input",
        name: "DESTINATION_DIR",
        message: "Destination dir (absolute)",
        default: defaults.DESTINATION_DIR,
        validate: makeValidator("DESTINATION_DIR"),
      },
      {
        type: "list",
        name: "REPO_VISIBILITY",
        message: "Repo visibility",
        choices: repoVisibilities,
        default: defaults.REPO_VISIBILITY,
      },
      {
        type: "input",
        name: "REMOTE_BASE_URL",
        message: "Remote base URL",
        default: defaults.REMOTE_BASE_URL,
        filter: (value: string) => (value.endsWith("/") ? value : value + "/"),
        validate: makeValidator("REMOTE_BASE_URL"),
      },
    ]);

    const cfg = ConfigSchema.parse(answers);

    await writeSchemaIfMissing();
    const withSchema = { $schema: "./" + path.basename(SCHEMA_PATH), ...cfg };
    // eslint-disable-next-line import/no-named-as-default-member
    await fs.writeJson(CONFIG_PATH, withSchema, { spaces: 2 });

    return cfg;
  }
}

export async function loadConfig(): Promise<Config> {
  // eslint-disable-next-line import/no-named-as-default-member
  const json = await fs.readJson(CONFIG_PATH);
  return ConfigSchema.parse(json);
}

async function writeSchemaIfMissing() {
  if (await exists(SCHEMA_PATH)) return;

  const jsonSchema = z.toJSONSchema(ConfigFileSchema, { target: "draft-7" });

  // eslint-disable-next-line import/no-named-as-default-member
  await fs.writeJson(SCHEMA_PATH, jsonSchema, { spaces: 2 });
}

type Config = z.infer<typeof ConfigSchema>;

function makeValidator(key: keyof Config) {
  return (value: unknown) => {
    const result = ConfigSchema.pick({ [key]: true }).safeParse({
      [key]: value,
    });
    return result.success || (result.error.issues[0]?.message ?? "invalid");
  };
}
