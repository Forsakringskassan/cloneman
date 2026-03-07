import fs from "node:fs/promises";

/**
 * Read a JSON file.
 *
 * @public
 * @since v1.0.0
 * @param filePath - Full path to configuration file.
 */
export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}
