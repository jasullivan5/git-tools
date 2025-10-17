import path from "node:path";
import os from "node:os";
import { type RepoVisibility, parseVisibility } from "../domain/repo.js";
import { read } from "../application/environment-utilities.js";

export const ENV = {
  get REPO_OWNER() {
    return read<string>({ key: "REPO_OWNER", default_: "jasullivan5-org" });
  },
  get DESTINATION_DIR() {
    return read<string>({
      key: "DESTINATION_DIR",
      default_: path.resolve(os.homedir(), "repos"),
    });
  },
  get REPO_VISIBILITY() {
    return read<RepoVisibility>({
      key: "REPO_VISIBILITY",
      parse: parseVisibility,
      default_: "public",
    });
  },
  get REMOTE_BASE_URL() {
    return read<string>({
      key: "REMOTE_BASE_URL",
      default_: "https://github.com/",
    });
  },
} as const;
