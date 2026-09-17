import fs from "node:fs/promises";

/**
 * @internal
 */
export async function replaceInFile(
    filePath: string,
    options: {
        match?: RegExp | undefined;
        pattern: string | RegExp;
        replacement: string | ((match: string, ...args: string[]) => string);
    },
): Promise<void> {
    const { match = /.*/, pattern, replacement } = options;
    const content = await fs.readFile(filePath, "utf8");
    const fn =
        typeof replacement === "string" ? () => replacement : replacement;
    const updated = content
        .split("\n")
        .map((line) => {
            match.lastIndex = 0;
            if (match.test(line)) {
                return line.replace(
                    pattern,
                    (match: string, ...args: string[]) => {
                        return fn(match, ...args);
                    },
                );
            }
            return line;
        })
        .join("\n");
    await fs.writeFile(filePath, updated, "utf8");
}
