import fs from "node:fs/promises";
import deepmerge from "deepmerge";
import { readJsonFile } from "./read-json-file";
import { writeJsonFile } from "./write-json-file";

function overwriteMerge(_a: unknown[], b: unknown[]): unknown[] {
    return b;
}

async function sniffTrailer(filePath: string): Promise<string> {
    const raw = await fs.readFile(filePath, "utf8");
    const match = /(\r?\n)$/.exec(raw);
    if (match) {
        return match[1];
    } else {
        return "";
    }
}

/**
 * Reads the current JSON file at `filePath`, merges it with `content` and
 * writes the updated file.
 *
 * - Objects are updated recursively, keys set to `undefined` are removed
 *   from the target object.
 * - Arrays are always replaced.
 *
 * Trailing newline is preserved if present.
 *
 * @internal
 * @param filePath - Path to the file to update
 * @param content - Content to update.
 */
export async function updateJsonFile(
    filePath: string,
    content: object,
): Promise<void> {
    const [original, trailer] = await Promise.all([
        readJsonFile<object>(filePath),
        sniffTrailer(filePath),
    ]);
    const updated = deepmerge(original, content, {
        arrayMerge: overwriteMerge,
    });
    await writeJsonFile(filePath, updated, {
        indent: 2,
        trailer,
    });
}
