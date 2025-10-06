export function loadConfig(): string {
  const org = process.env["GITHUB_ORG"];

  if (!org) {
    throw new Error(
      "Missing organization identifier. Set GITHUB_ORG in your environment.",
    );
  }

  return org;
}
