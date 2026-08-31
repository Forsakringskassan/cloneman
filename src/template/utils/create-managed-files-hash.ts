import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { type PackageJson } from "../../utils";
import { getStoredFileName } from "./get-stored-file-name";

/**
 * Creates a SHA-256 hash from the contents of all managed template files.
 *
 * Line endings are normalized to LF before hashing so the resulting hash is
 * identical regardless of whether files were checked out with CRLF (e.g. on
 * Windows with `core.autocrlf`) or LF (e.g. on Linux/macOS) line endings.
 *
 * The template's `package.json` is included with `dependencies`,
 * `devDependencies` and `version` stripped, since those are expected to
 * change without requiring a rebuild.
 *
 * @internal
 */
export async function createManagedFilesHash(
    filesDir: string,
    managedFiles: string[],
    pkg: PackageJson,
): Promise<string> {
    const ignoredFiles = new Set(["package.json"]);
    const hashedFiles = managedFiles.filter((file) => !ignoredFiles.has(file));
    const contents = await Promise.all([
        Promise.resolve(hashPackageJson(pkg)),
        ...hashedFiles.map((file) => readManagedFile(filesDir, file)),
    ]);
    return createHash("sha256").update(Buffer.concat(contents)).digest("hex");
}

function hashPackageJson(pkg: PackageJson): Buffer {
    const { dependencies, devDependencies, version, ...rest } = pkg;
    return Buffer.from(JSON.stringify(rest), "utf8");
}

async function readManagedFile(
    filesDir: string,
    file: string,
): Promise<Buffer> {
    const filePath = path.join(filesDir, getStoredFileName(file));
    const raw = await fs.readFile(filePath);
    return raw;
}
