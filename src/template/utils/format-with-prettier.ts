import { readFile, writeFile } from "node:fs/promises";
import type * as Prettier from "prettier";

/**
 * @internal
 */
export async function formatWithPrettier(filePath: string): Promise<void> {
    let prettier: typeof Prettier;
    try {
        prettier = await import("prettier");
    } catch {
        return;
    }

    const source = await readFile(filePath, "utf8");
    const options = await prettier.resolveConfig(filePath);
    const formatted = await prettier.format(source, {
        ...options,
        filepath: filePath,
    });

    await writeFile(filePath, formatted, "utf8");
}
