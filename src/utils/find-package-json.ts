import { glob } from "node:fs/promises";
import { join } from "node:path";
import { type PackageJson, readJsonFile } from ".";

/**
 * @internal
 */
export interface FindPackageJsonResult {
    /**
     * The content of the found package.json file.
     */
    packageJson: PackageJson;
    /**
     * The relative path to the found package.json.
     */
    path: string;
}

/**
 * Finds all nested package.json files within a given directory, ignoring the root package.json.
 * @internal
 */
export async function findPackageJson(
    templateDir: string,
): Promise<FindPackageJsonResult[]> {
    const iterator = glob("*/**/package.json", {
        cwd: templateDir,
    });

    const allFiles = await Array.fromAsync(iterator);

    return Promise.all(
        allFiles.map(async (file: string) => ({
            packageJson: await readJsonFile<PackageJson>(
                join(templateDir, file),
            ),
            path: file,
        })),
    );
}
