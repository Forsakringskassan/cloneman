import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { type PackageJson, readJsonFile } from "../../utils";
import { getStoredFileName } from "./get-stored-file-name";

/**
 * Creates a SHA-256 hash from the contents of all managed files and files in hooks folder.
 *
 * All `package.json` files found (both root and in subdirectories) are included with
 * `dependencies`, `devDependencies` and `version` stripped, since those are
 * expected to change without requiring a rebuild.
 *
 * @internal
 */
export async function createManagedFilesHash(
    filesDir: string,
    hooksDir: string,
    fileList: string[],
    pkg: PackageJson,
): Promise<string> {
    const ignoredFiles = new Set(["package.json"]);
    const hashedFiles = fileList.filter((file) => !ignoredFiles.has(file));
    const hookFiles = await listHookFiles(hooksDir);
    const contents = await Promise.all([
        Promise.resolve(hashPackageJson(pkg)),
        ...hashedFiles.map((file) => readManagedFile(filesDir, file)),
        ...hookFiles.map((file) => fs.readFile(path.join(hooksDir, file))),
    ]);
    return createHash("sha256").update(Buffer.concat(contents)).digest("hex");
}

async function listHookFiles(hooksDir: string): Promise<string[]> {
    const files = await Array.fromAsync(
        fs.glob("**/*", { cwd: hooksDir, withFileTypes: true }),
    );

    return files
        .filter((it) => it.isFile())
        .map((it) => path.relative(hooksDir, path.join(it.parentPath, it.name)))
        .toSorted((a, b) => a.localeCompare(b));
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

    if (path.basename(file) === "package.json") {
        return hashPackageJson(await readJsonFile<PackageJson>(filePath));
    }

    return raw;
}
