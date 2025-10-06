import path from "node:path";

export type RepoPathState = "created" | "existed";

export class RepoPath {
  public readonly absolutePath: string;
  public readonly basename: string;
  public readonly parentDirectory: string;

  constructor(input: string) {
    if (!input || typeof input !== "string") {
      throw new TypeError("Path is required and must be a string.");
    }

    const abs = path.normalize(path.resolve(process.cwd(), input));
    const name = path.basename(abs);
    if (!name) {
      throw new Error(`Could not derive repo name from path: ${input}`);
    }

    this.absolutePath = abs;
    this.basename = name;
    this.parentDirectory = path.dirname(abs);

    Object.freeze(this); // ensure immutability
  }

  toString(): string {
    return this.absolutePath;
  }

  equals(other: RepoPath): boolean {
    return (
      other instanceof RepoPath && this.absolutePath === other.absolutePath
    );
  }

  join(...segments: string[]): string {
    return path.join(this.absolutePath, ...segments);
  }

  getGitPath(): string {
    return path.join(this.absolutePath, ".git");
  }
}
