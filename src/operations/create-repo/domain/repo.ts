import path from "node:path";

const baseUrl = process.env["GIT_BASE_URL"] ?? "https://github.com/";
const defaultVisibility = getVisibilityOrDefault(
  process.env["GIT_DEFAULT_VISIBILITY"],
);

export class Repo {
  constructor(
    readonly owner: string,
    readonly directory: string,
    readonly visibility: Visibility = defaultVisibility,
  ) {
    Object.freeze(this);
  }

  get name() {
    return path.basename(this.directory);
  }
  get parentDirectory() {
    return path.dirname(this.directory);
  }
  get fullName() {
    return `${this.owner}/${this.name}`;
  }
  get url() {
    return new URL(`${this.fullName}.git`, baseUrl).href;
  }
}

export const visibilities = new Set(["public", "private", "internal"] as const);
export type Visibility = typeof visibilities extends Set<infer T> ? T : never;
export function isVisibility(value: unknown): value is Visibility {
  return visibilities.has(value as Visibility);
}
function getVisibilityOrDefault(value: unknown) {
  return isVisibility(value) ? value : "public";
}
