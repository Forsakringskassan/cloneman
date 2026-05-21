import fs from "node:fs/promises";
import deepmerge from "deepmerge";
import detectIndent from "detect-indent";
import { readJsonFile } from "./read-json-file";
import { writeJsonFile } from "./write-json-file";

function overwriteMerge(_a: unknown[], b: unknown[]): unknown[] {
    return b;
}

async function sniff(
    filePath: string,
): Promise<{ indent: string; trailer: string }> {
    const raw = await fs.readFile(filePath, "utf8");
    const { indent } = detectIndent(raw);
    const match = /(\r?\n)$/.exec(raw);
    const trailer = match ? match[0] : "";
    return {
        indent,
        trailer,
    };
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
    const [original, options] = await Promise.all([
        readJsonFile<object>(filePath),
        sniff(filePath),
    ]);
    const updated = deepmerge(original, content, {
        arrayMerge: overwriteMerge,
    });
    await writeJsonFile(filePath, updated, options);
}
