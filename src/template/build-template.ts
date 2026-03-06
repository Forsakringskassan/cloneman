import fs from "node:fs/promises";
import path from "node:path";
import { type NormalizedTemplateConfig } from "../config";
import { type PackageJson } from "../utils/package-json";

import { copyFiles } from "./utils/copy-files";
import { createclonemanPackageJson } from "./utils/create-cloneman-package-json";
import { createMassagedTemplatePackageJson } from "./utils/create-massaged-template-package-json";

/**
 * @public
 * @since v1.0.0
 * @returns List of template files.
 */
export async function buildTemplate(
    name: string,
    pkg: PackageJson,
    targetDir: string,
    config: NormalizedTemplateConfig,
): Promise<string[]> {
    console.group(`Assembling cloneman template "${name}@${pkg.version}"`);

    const filesDir = path.join(targetDir, "files");
    await prepareFolders(targetDir, filesDir);

    const { managedFiles, ignoredFiles: templateIgnoredFiles } = config;

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

    await createMassagedTemplatePackageJson(
        clonemanPackageJson,
        pkg,
        { dependencies: [] },
        filesDir,
    );

    console.groupEnd();

    return files;
}

async function prepareFolders(
    targetDir: string,
    filesDir: string,
): Promise<void> {
    await fs.rm(targetDir, { recursive: true, force: true });
    await fs.mkdir(filesDir, { recursive: true });
}
