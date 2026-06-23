import fs from "node:fs/promises";
import detectIndent from "detect-indent";

async function sniff(
    filePath: string,
    options: { indent: number | string; trailer: string },
): Promise<{ indent: number | string; trailer: string }> {
    let raw: string;
    try {
        raw = await fs.readFile(filePath, "utf8");
    } catch {
        return options;
    }
    const { indent } = detectIndent(raw);
    const match = /\r?\n$/.exec(raw);
    const trailer = match ? match[0] : "";
    return {
        indent,
        trailer,
    };
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
    options: { indent: number | string; trailer: string },
): Promise<void> {
    if (value === undefined || value === null) {
        throw new TypeError(
            `writeJsonFile(): value "${String(value)}" cannot be serialized to JSON`,
        );
    }
    const { indent, trailer } = await sniff(filename, options);
    const content = JSON.stringify(value, null, indent);
    await fs.writeFile(filename, `${content}${trailer}`, "utf8");
}
