import { readFile, writeFile } from "node:fs/promises";
import { type PartiallyManagedFile } from "./package-json";

export async function preparePartiallyManagedFile(
    partial: PartiallyManagedFile,
    filePath: string,
): Promise<void> {
    const content = await readFile(filePath, "utf8");
    const lines = content.split("\n");
    const { include } = partial;

    if ("above" in include) {
        if (!lines.includes(include.above)) {
            lines.push(include.above);
        }
    } else if ("below" in include) {
        if (!lines.includes(include.below)) {
            lines.unshift(include.below);
        }
    } else if ("block" in include) {
        if (!lines.includes(include.block.begin)) {
            lines.unshift(include.block.begin);
        }
        if (!lines.includes(include.block.end)) {
            lines.push(include.block.end);
        }
    }

    const updatedContent = lines.join("\n");

    if (content !== updatedContent) {
        await writeFile(filePath, updatedContent, "utf8");
    }
}
