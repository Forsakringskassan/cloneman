import fs from "node:fs/promises";

async function sniffTrailer(
    filePath: string,
    options: { trailer: string },
): Promise<string> {
    let raw: string;
    try {
        raw = await fs.readFile(filePath, "utf8");
    } catch {
        return options.trailer;
    }
    const match = /(\r?\n)$/.exec(raw);
    return match ? match[1] : "";
}

/**
 * Serializes `value` as JSON and writes it to `filename`.
 *
 * If the file already exists it is overwritten but trailing newline is
 * preserved if present in the existing file.
 *
 * @internal
 */
export async function writeJsonFile(
    filename: string,
    value: unknown,
    options: { indent: number; trailer: string },
): Promise<void> {
    const { indent } = options;
    const trailer = await sniffTrailer(filename, options);
    const content = JSON.stringify(value, null, indent);
    await fs.writeFile(filename, `${content}${trailer}`, "utf8");
}
