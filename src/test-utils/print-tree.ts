import fs from "node:fs/promises";
import path from "node:path";

/**
 * List of directory and file names to exclude from the tree output.
 */
const exclude = new Set(["node_modules"]);

/**
 * Generate a tree-like string representation of a directory structure.
 * Files and subdirectories are sorted alphabetically.
 *
 * @internal
 * @param rootPath - The directory path to generate tree for
 * @returns A string with tree-like representation
 */
export async function printTree(rootPath: string): Promise<string> {
    const lines: string[] = [];

    async function walk(
        currentPath: string,
        prefix: string,
        isLast: boolean,
    ): Promise<void> {
        const name = path.basename(currentPath);
        const connector = isLast ? "└── " : "├── ";

        if (name) {
            const line = prefix === "" ? "(root)" : prefix + connector + name;
            lines.push(line);
        }

        const stats = await fs.stat(currentPath);
        if (stats.isDirectory()) {
            const entries = await fs.readdir(currentPath);
            const filteredEntries = entries.filter(
                (entry) => !exclude.has(entry),
            );
            const sortedEntries = filteredEntries.toSorted((a, b) =>
                a.localeCompare(b),
            );

            const extension = isLast ? "    " : "│   ";
            const newPrefix = name ? prefix + extension : "";

            for (let i = 0; i < sortedEntries.length; i++) {
                const entryPath = path.join(currentPath, sortedEntries[i]);
                const isLastEntry = i === sortedEntries.length - 1;
                await walk(entryPath, newPrefix, isLastEntry);
            }
        }
    }

    await walk(rootPath, "", true);
    return lines.join("\n");
}
