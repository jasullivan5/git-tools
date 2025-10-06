import { execa } from "execa";
import prompts, { type Options as PromptOptions } from "prompts";
import pc from "picocolors";

export async function promptPurpose(): Promise<string> {
  const options: PromptOptions = {
    onCancel: () => {
      throw new Error("Prompt cancelled by user.");
    },
  };

  let trimmed = "";
  do {
    // 1) capture as unknown to avoid unsafe-assignment from `any`
    const answers = await prompts(
      {
        type: "text",
        name: "value",
        message: "What’s the purpose of this repo?",
      },
      options,
    );

    // 2) narrow with a guard before member access
    trimmed = answers.value.trim();
  } while (!trimmed);

  return trimmed;
}

export function printSummary(info: {
  absPath: string;
  org: string;
  name: string;
  defaultBranch: string;
  webUrl: string;
}): void {
  const lines = [
    pc.bold(pc.green("✓ Repository created successfully")),
    `${pc.bold("Local:")} ${info.absPath}`,
    `${pc.bold("Remote:")} ${info.webUrl}`,
    `${pc.bold("Default branch:")} ${info.defaultBranch}`,
    `${pc.bold("Owner (org):")} ${info.org}`,
  ];
  console.log(lines.join("\n"));
}

export async function askOpenInVSCode(absPath: string): Promise<void> {
  const { open } = await prompts({
    type: "toggle",
    name: "open",
    message: "Open this repo in VS Code now?",
    initial: true,
    active: "Yes",
    inactive: "No",
  });

  if (!open) return;

  try {
    await execa("code", [absPath], { stdio: "ignore" });
  } catch {
    // If 'code' is not on PATH, provide a helpful hint.
    console.error(
      pc.red(
        "Failed to launch VS Code with the 'code' command. " +
          "Make sure VS Code is installed and the 'code' CLI is available in your PATH.",
      ),
    );
    console.error(`You can still open it manually: ${pc.underline(absPath)}`);
  }
}
