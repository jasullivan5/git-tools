import path from "node:path";
import { createSetParser } from "../application/create-set-parser.js";

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

export const repoVisibilities = new Set([
  "public",
  "private",
  "internal",
] as const);

export type RepoVisibility =
  typeof repoVisibilities extends Set<infer T> ? T : never;

export const parseVisibility =
  createSetParser<RepoVisibility>(repoVisibilities);
