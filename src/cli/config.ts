import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import inquirer from "inquirer";
import { repoVisibilities } from "../domain/repo.js";

const CONFIG_PATH = path.join(os.homedir(), "wcp-config.json");
const SCHEMA_PATH = path.join(os.homedir(), "wcp-config.schema.json");
const ConfigSchema = z
  .object({
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
      .transform((url: string) => (url.endsWith("/") ? url : url + "/")),
  })
  .strict();

export async function ensureConfigInteractive(): Promise<Config> {
  try {
    return loadConfig();
  } catch (error) {
    if (fs.existsSync(CONFIG_PATH)) throw error; // exists but invalid → surface errors
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
        validate: (value: string) => (value ? true : "Required"),
      },
      {
        type: "input",
        name: "DESTINATION_DIR",
        message: "Destination dir (absolute)",
        default: defaults.DESTINATION_DIR,
        validate: (value: string) =>
          path.isAbsolute(value) || "Must be absolute path",
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
        validate: (value: string) =>
          z.url().safeParse(value).success || "Must be a valid URL",
      },
    ]);

    // Validate & normalize via Zod (normalizes trailing slash)
    const cfg = ConfigSchema.parse(answers);

    // Write schema + config (with $schema pointer)
    writeSchemaIfMissing();
    const withSchema = { $schema: "./" + path.basename(SCHEMA_PATH), ...cfg };
    fs.writeFileSync(
      CONFIG_PATH,
      JSON.stringify(withSchema, null, 2) + "\n",
      "utf8",
    );

    return cfg;
  }
}

type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  const json = JSON.parse(raw);
  const result = ConfigSchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid config at ${CONFIG_PATH}:\n${issues}`);
  }
  return result.data;
}

function writeSchemaIfMissing() {
  if (fs.existsSync(SCHEMA_PATH)) return;
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "WCP Config",
    type: "object",
    properties: {
      REPO_OWNER: { type: "string", minLength: 1 },
      DESTINATION_DIR: { type: "string", minLength: 1 },
      REPO_VISIBILITY: { type: "string", enum: repoVisibilities },
      REMOTE_BASE_URL: { type: "string", format: "uri" },
    },
    required: [
      "REPO_OWNER",
      "DESTINATION_DIR",
      "REPO_VISIBILITY",
      "REMOTE_BASE_URL",
    ],
    additionalProperties: false,
  };
  fs.writeFileSync(SCHEMA_PATH, JSON.stringify(schema, null, 2) + "\n", "utf8");
}
