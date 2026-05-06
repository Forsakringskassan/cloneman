import fs from "node:fs/promises";
import path from "node:path";
import {
    type NormalizedTemplateConfig,
    type TemplateConfig,
    normalizeTemplateConfig,
} from "../config";
import { readJsonFile, writeJsonFile } from "../utils";
import { type PackageJson } from "../utils/package-json";

import { updateJson } from "./update-json";
import { copyFiles } from "./utils/copy-files";
import { createclonemanPackageJson } from "./utils/create-cloneman-package-json";
import { prepareTemplatePackageJson } from "./utils/prepare-template-package-json";
import { updateRenovateWithIgnoredDeps } from "./utils/update-renovate-with-ignored-deps";
import { writeFile } from "./write-file";

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
    /**
     * Writes a file to the template's file directory.
     *
     * @public
     * @since v1.8.0
     * @param filePath - Path relative to the template root.
     * @param content - Content to write to the file.
     * @returns A promise resolved when the file has been written.
     */
    writeFile(filePath: string, content: string): Promise<void>;
}

/**
 * Builds a cloneman template.
 *
 * @internal
 */
export async function buildTemplate(options: {
    logger: Console;
    name: string;
    templateDir: string;
    targetDir: string;
    config: TemplateConfig | NormalizedTemplateConfig;
}): Promise<BuildTemplateResult> {
    const { logger, name, templateDir, targetDir, config } = options;
    const pkgJsonPath = path.join(templateDir, "package.json");
    const pkg = await readJsonFile<PackageJson>(pkgJsonPath);

    logger.group(`Assembling cloneman template "${name}@${pkg.version}"`);

    const filesDir = path.join(targetDir, "files");
    await prepareFolders(targetDir, filesDir);

    const templateConfig = normalizeTemplateConfig(config);
    const {
        managedFiles,
        ignoredFiles: templateIgnoredFiles,
        ignoredDependencies: templateIgnoredDependencies,
        uninstallDependencies,
    } = templateConfig;

    const ignoredFiles = [
        ...templateIgnoredFiles,
        "package.json",
        ".cloneman/**",
    ];

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

    const files = await copyFiles(logger, templateDir, filesDir, ignoredFiles);

    await fs.writeFile(path.join(targetDir, "index.js"), indexJs);

    const clonemanPackageJson = await createclonemanPackageJson(
        path.join(targetDir, "package.json"),
        {
            name,
            version: pkg.version,
            boilerplateFiles: files,
            uninstallDependencies,
            ignoredDependencies: templateIgnoredDependencies,
            managedFiles,
        },
    );

    const massagedTemplatePackageJson = prepareTemplatePackageJson(
        clonemanPackageJson,
        pkg,
    );

    await writeJsonFile(
        path.join(filesDir, "package.json"),
        massagedTemplatePackageJson,
    );

    logger.groupEnd();

    return {
        updateJson: updateJson.bind(undefined, { filesDir }),
        renovateIgnoreDependencies() {
            return renovateIgnoreDependencies(
                massagedTemplatePackageJson,
                clonemanPackageJson.name,
                templateConfig,
                filesDir,
                managedFiles,
            );
        },
        writeFile: writeFile.bind(undefined, { filesDir }),
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
    templateConfig: TemplateConfig,
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
        templateConfig,
    );
    await writeJsonFile(renovateFilePath, newConfig);
}
