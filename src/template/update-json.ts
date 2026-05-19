import path from "node:path";
import { updateJsonFile } from "../utils";

export interface UpdateJsonContext {
    readonly filesDir: string;
}

/**
 * @internal
 */
export function updateJson(
    context: UpdateJsonContext,
    filePath: string,
    content: object,
): Promise<void> {
    const { filesDir } = context;
    return updateJsonFile(path.join(filesDir, filePath), content);
}
