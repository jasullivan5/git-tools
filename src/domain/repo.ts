import path from "node:path";
import { createArrayParser } from "../application/create-array-parser.js";

export function createRepo(
  owner: string,
  directory: string,
  visibility: RepoVisibility,
  baseUrl: string,
) {
  return Object.freeze({
    get name() {
      return path.basename(directory);
    },
    get parentDirectory() {
      return path.dirname(directory);
    },
    get fullName() {
      return `${owner}/${this.name}`;
    },
    get url() {
      return new URL(`${this.fullName}.git`, baseUrl).href;
    },
    get visibility() {
      return visibility;
    },
    get owner() {
      return owner;
    },
    get directory() {
      return directory;
    },
  });
}

export type Repo = ReturnType<typeof createRepo>;

export const repoVisibilities = ["public", "private", "internal"] as const;

export type RepoVisibility = (typeof repoVisibilities)[number];

export const parseVisibility = createArrayParser(repoVisibilities);
