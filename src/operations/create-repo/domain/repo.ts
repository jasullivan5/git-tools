import path from "node:path";
import { ENV } from "../../../environment.js";
import type { RepoVisibility } from "./repo-visibility.js";

export function createRepo(
  owner: string,
  directory: string,
  visibility?: RepoVisibility,
) {
  const _owner = owner;
  const _directory = directory;
  const _visibility = visibility ?? ENV.REPO_VISIBILITY;
  const _baseUrl = ENV.REMOTE_BASE_URL;

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
