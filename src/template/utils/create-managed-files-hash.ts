import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getStoredFileName } from "./get-stored-file-name";

/**
 * Creates a SHA-256 hash from the contents of all managed template files.
 *
 * Line endings are normalized to LF before hashing so the resulting hash is
 * identical regardless of whether files were checked out with CRLF (e.g. on
 * Windows with `core.autocrlf`) or LF (e.g. on Linux/macOS) line endings.
 *
 * @internal
 */
export async function createManagedFilesHash(
    filesDir: string,
    managedFiles: string[],
): Promise<string> {
    const ignoredFiles = new Set(["package.json"]);
    const hashedFiles = managedFiles.filter((file) => !ignoredFiles.has(file));
    const contents = await Promise.all(
        hashedFiles.map((file) => readManagedFile(filesDir, file)),
    );
    return createHash("sha256").update(Buffer.concat(contents)).digest("hex");
}

async function readManagedFile(
    filesDir: string,
    file: string,
): Promise<Buffer> {
    const { dir, base } = path.parse(file);
    const filePath = path.join(filesDir, dir, getStoredFileName(base));
    const raw = await fs.readFile(filePath);
    return normalizeLineEndings(raw);
}

function normalizeLineEndings(buffer: Buffer): Buffer {
    return Buffer.from(
        buffer.toString("binary").replaceAll("\r\n", "\n"),
        "binary",
    );
}
