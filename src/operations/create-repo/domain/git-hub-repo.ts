import path from "node:path";

const baseUrl = "https://github.com/";
const urlSuffix = ".git";

export type Visibility = "public" | "private" | "internal";

export class GitHubRepo {
  constructor(
    readonly owner: string,
    readonly directory: string,
    readonly visibility: Visibility = "public",
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
    return `${baseUrl}${this.fullName}${urlSuffix}`;
  }
}
