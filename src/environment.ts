import path from "node:path";
import os from "node:os";
import {
  type RepoVisibility,
  parseVisibility,
} from "./operations/create-repo/domain/repo-visibility.js";

/* eslint-disable security/detect-object-injection */
type Coerce<T> = (raw: string) => T;

const asString: Coerce<string> = (v) => v;
// const asNumber: Coerce<number> = (v) => {
//   const n = Number(v);
//   if (Number.isNaN(n)) throw new Error(`Expected number, got "${v}"`);
//   return n;
// };
// const asBool: Coerce<boolean> = (v) => /^(1|true|yes|on)$/i.test(v);

interface Spec<T> {
  key: string;
  parse?: Coerce<T>;
  default_?: T; // if omitted, var is required
  allowEmpty?: boolean; // treat empty string as valid
}

function read<T>({
  key,
  parse = asString as Coerce<T>,
  default_,
  allowEmpty,
}: Spec<T>): T {
  const raw = process.env[key];
  if (raw == null || (!allowEmpty && raw === "")) {
    if (default_ !== undefined) return default_;
    throw new Error(`Missing required env var: ${key}`);
  }
  return parse(raw);
}

// Export your config, evaluated once at startup:
export const ENV = {
  REPO_OWNER: read<string>({
    key: "REPO_OWNER",
    default_: "jasullivan5-org",
  }),
  DESTINATION_DIR: read<string>({
    key: "DESTINATION_DIR",
    default_: path.resolve(os.homedir(), "repos"),
  }),
  REPO_VISIBILITY: read<RepoVisibility>({
    key: "REPO_VISIBILITY",
    parse: parseVisibility,
    default_: "public",
  }),
  REMOTE_BASE_URL: read<string>({
    key: "REMOTE_BASE_URL",
    default_: "https://github.com/",
  }),
} as const;
