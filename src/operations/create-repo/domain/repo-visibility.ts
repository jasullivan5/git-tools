import { createSetParser } from "../application/create-set-parser.js";

export const repoVisibilities = new Set([
  "public",
  "private",
  "internal",
] as const);

export type RepoVisibility =
  typeof repoVisibilities extends Set<infer T> ? T : never;

export const parseVisibility =
  createSetParser<RepoVisibility>(repoVisibilities);
