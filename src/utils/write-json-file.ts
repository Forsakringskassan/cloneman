import fs from "node:fs/promises";

/**
 * @internal
 */
export async function writeJsonFile(
    filename: string,
    value: unknown,
    options: { indent: number; trailer: string },
): Promise<void> {
    const { indent, trailer } = options;
    const content = JSON.stringify(value, null, indent);
    await fs.writeFile(filename, `${content}${trailer}`, "utf8");
}
