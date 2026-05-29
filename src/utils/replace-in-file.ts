import fs from "node:fs/promises";

/**
 * @internal
 */
export async function replaceInFile(
    filePath: string,
    options: {
        match?: RegExp | undefined;
        pattern: string | RegExp;
        replacement: string;
    },
): Promise<void> {
    const { match = /.*/, pattern, replacement } = options;
    const content = await fs.readFile(filePath, "utf8");
    const updated = content
        .split("\n")
        .map((line) => {
            match.lastIndex = 0;
            if (match.test(line)) {
                return line.replaceAll(pattern, replacement);
            } else {
                return line;
            }
        })
        .join("\n");
    await fs.writeFile(filePath, updated, "utf8");
}
