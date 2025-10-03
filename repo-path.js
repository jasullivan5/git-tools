// repo-path.js
// @ts-check
import path from "node:path";

/**
 * Value object representing a normalized, absolute repository path.
 * Immutable once constructed.
 */
export class RepoPath {
  /**
   * The full normalized absolute path to the repository.
   * @type {string}
   * @readonly
   */
  absolutePath;

  /**
   * The name of the repository (last path segment).
   * @type {string}
   * @readonly
   */
  basename;

  /**
   * The parent directory containing the repository.
   * @type {string}
   * @readonly
   */
  parentDirectory;

  /**
   * Construct a RepoPath from user-supplied input.
   * Input may be relative or absolute; it will always be normalized
   * and resolved against the current working directory.
   *
   * @param {string} input - User-supplied repo path.
   * @throws {TypeError} If input is not a string.
   * @throws {Error} If a repository name cannot be derived from the path.
   */
  constructor(input) {
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

  /**
   * Return the absolute path as a string.
   * @returns {string}
   */
  toString() {
    return this.absolutePath;
  }

  /**
   * Compare with another RepoPath for equality.
   * @param {RepoPath} other - Another RepoPath to compare against.
   * @returns {boolean} True if both represent the same absolute path.
   */
  equals(other) {
    return (
      other instanceof RepoPath && this.absolutePath === other.absolutePath
    );
  }

  /**
   * Join one or more path segments onto this repo's absolute path.
   * @param {...string} segments - Path segments to append.
   * @returns {string} The combined path.
   */
  join(...segments) {
    return path.join(this.absolutePath, ...segments);
  }

  /**
   * Get the `.git` directory path inside this repository.
   * @returns {string} Absolute path to the `.git` directory.
   */
  gitDir() {
    return path.join(this.absolutePath, ".git");
  }
}
