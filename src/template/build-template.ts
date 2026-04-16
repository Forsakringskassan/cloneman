import fs from "node:fs/promises";
import path from "node:path";
import { type NormalizedTemplateConfig } from "../config";
import { readJsonFile, writeJsonFile } from "../utils";
import { type PackageJson } from "../utils/package-json";

import { updateJson } from "./update-json";
import { copyFiles } from "./utils/copy-files";
import { createclonemanPackageJson } from "./utils/create-cloneman-package-json";
import { prepareTemplatePackageJson } from "./utils/prepare-template-package-json";
import { updateRenovateWithIgnoredDeps } from "./utils/update-renovate-with-ignored-deps";

/**
 * @public
 * @since v1.2.0
 */
export interface BuildTemplateResult {
    /**
     * Updates the content of the JSON file at given path with given content.
     *
     * - Objects are updated recursively, keys set to `undefined` are removed
     *   from the target object.
     * - Arrays are always replaced.
     *
     * @public
     * @since v1.5.0
     * @param filePath - Path relative to the template root.
     * @param content - Content to add to the existing JSON.
     * @returns A promise resolved when the updated file has been written.
     */
    updateJson(this: void, filePath: string, content: unknown): Promise<void>;

    /**
     * Append template specific dependencies to the "ignoreDeps" array in the template's "renovate.json".
     */
    renovateIgnoreDependencies(): Promise<void>;

    /**
     * List of files included in the template
     */
    readonly files: string[];
}

/**
 * Builds a cloneman template.
 *
 * @public
 * @since v1.2.0
 * @param pkg - The `package.json` content of the template (from the root of the template).
 */
export async function buildTemplate(
    name: string,
    pkg: PackageJson,
    targetDir: string,
    config: NormalizedTemplateConfig,
): Promise<BuildTemplateResult> {
    console.group(`Assembling cloneman template "${name}@${pkg.version}"`);

    const filesDir = path.join(targetDir, "files");
    await prepareFolders(targetDir, filesDir);

    const {
        managedFiles,
        ignoredFiles: templateIgnoredFiles,
        ignoredDependencies: templateIgnoredDependencies,
    } = config;

    const ignoredFiles = [
        ...templateIgnoredFiles,
        "package.json",
        ".cloneman/**",
    ];

    const ignoredDependencies = [...templateIgnoredDependencies, "cloneman"];

    const indexJs = `
        import fs from "node:fs/promises";
        import path from "node:path";

        const packageJsonFile = await fs.readFile(path.join(import.meta.dirname, "package.json"), "utf8");
        const packageJson = JSON.parse(packageJsonFile);


        const options = {
            ...packageJson.cloneman,
            filesDir: path.join(import.meta.dirname, "files"),
        }


        export default options;
    `;

    const files = await copyFiles(filesDir, ignoredFiles);

    await fs.writeFile(path.join(targetDir, "index.js"), indexJs);

    const clonemanPackageJson = await createclonemanPackageJson(
        path.join(targetDir, "package.json"),
        {
            name,
            version: pkg.version,
            boilerplateFiles: files,
            managedFiles,
        },
    );

    const massagedTemplatePackageJson = prepareTemplatePackageJson(
        clonemanPackageJson,
        pkg,
        ignoredDependencies,
    );

    await writeJsonFile(
        path.join(filesDir, "package.json"),
        massagedTemplatePackageJson,
    );

    console.groupEnd();

    return {
        updateJson: updateJson.bind(undefined, { filesDir }),
        renovateIgnoreDependencies() {
            return renovateIgnoreDependencies(
                massagedTemplatePackageJson,
                clonemanPackageJson.name,
                filesDir,
                managedFiles,
            );
        },
        files,
    };
}

async function prepareFolders(
    targetDir: string,
    filesDir: string,
): Promise<void> {
    await fs.rm(targetDir, { recursive: true, force: true });
    await fs.mkdir(filesDir, { recursive: true });
}

async function renovateIgnoreDependencies(
    packageJson: PackageJson,
    templatePackageName: string,
    filesDir: string,
    managedFiles: string[],
): Promise<void> {
    if (!managedFiles.includes("renovate.json")) {
        return;
    }

    const renovateFilePath = path.join(filesDir, "renovate.json");

    const renovateConfig =
        await readJsonFile<Record<string, unknown>>(renovateFilePath);

    const newConfig = updateRenovateWithIgnoredDeps(
        renovateConfig,
        packageJson,
        templatePackageName,
    );
    await writeJsonFile(renovateFilePath, newConfig);
}
