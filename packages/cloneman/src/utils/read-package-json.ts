import path from "node:path";
import { type PackageJson } from "./package-json";
import { readJsonFile } from "./read-json-file";

/**
 * Read `package.json` file from the template.
 *
 * @public
 * @since v1.0.0
 * @param dir - Directory root directory
 */
export async function readPackageJson(dir: string): Promise<PackageJson> {
    const filePath = path.join(dir, "package.json");
    return readJsonFile<PackageJson>(filePath);
}
