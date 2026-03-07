import fs from "node:fs/promises";

/**
 * @internal
 */
export async function writeJsonFile(
    filename: string,
    value: unknown,
): Promise<void> {
    const content = JSON.stringify(value, null, 2);
    await fs.writeFile(filename, content, "utf8");
}
