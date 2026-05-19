import deepmerge from "deepmerge";
import { readJsonFile } from "./read-json-file";
import { writeJsonFile } from "./write-json-file";

function overwriteMerge(_a: unknown[], b: unknown[]): unknown[] {
    return b;
}

/**
 * Reads the current JSON file at `filePath`, merges it with `content` and
 * writes the updated file.
 *
 * - Objects are updated recursively, keys set to `undefined` are removed
 *   from the target object.
 * - Arrays are always replaced.
 *
 * @internal
 * @param filePath - Path to the file to update
 * @param content - Content to update.
 */
export async function updateJsonFile(
    filePath: string,
    content: object,
): Promise<void> {
    const original = await readJsonFile<object>(filePath);
    const updated = deepmerge(original, content, {
        arrayMerge: overwriteMerge,
    });
    await writeJsonFile(filePath, updated);
}
