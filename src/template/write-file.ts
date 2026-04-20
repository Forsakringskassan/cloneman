import { writeFile as nodeWriteFile } from "node:fs/promises";
import { join } from "node:path";

export interface WriteFileContext {
    readonly filesDir: string;
}

/**
 * @internal
 */
export async function writeFile(
    context: WriteFileContext,
    filePath: string,
    content: string,
): Promise<void> {
    await nodeWriteFile(join(context.filesDir, filePath), content);
}
