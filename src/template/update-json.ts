import path from "node:path";
import deepmerge from "deepmerge";
import { readJsonFile, writeJsonFile } from "../utils";

export interface UpdateJsonContext {
    readonly filesDir: string;
}

/**
 * @internal
 */
export async function updateJson(
    context: UpdateJsonContext,
    filePath: string,
    content: object,
): Promise<void> {
    const { filesDir } = context;
    const original = await readJsonFile<object>(path.join(filesDir, filePath));
    const updated = deepmerge(original, content);
    await writeJsonFile(path.join(filesDir, filePath), updated);
}
