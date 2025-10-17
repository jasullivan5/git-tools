import path from "node:path";
import { createSetParser } from "../application/create-set-parser.js";

export function createRepo(
  owner: string,
  directory: string,
  visibility: RepoVisibility,
  baseUrl: string,
) {
  const _owner = owner;
  const _directory = directory;
  const _visibility = visibility;
  const _baseUrl = baseUrl;

  return Object.freeze({
    get name() {
      return path.basename(_directory);
    },
    get parentDirectory() {
      return path.dirname(_directory);
    },
    get fullName() {
      return `${_owner}/${this.name}`;
    },
    get url() {
      return new URL(`${this.fullName}.git`, _baseUrl).href;
    },
    get visibility() {
      return _visibility;
    },
    get owner() {
      return _owner;
    },
    get directory() {
      return _directory;
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
