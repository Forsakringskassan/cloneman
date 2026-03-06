import fs from "node:fs/promises";
import path from "node:path";
import { type NormalizedTemplateConfig } from "../config";
import { type PackageJson } from "../utils/package-json";

import { copyFiles } from "./utils/copy-files";
import { createclonemanPackageJson } from "./utils/create-cloneman-package-json";
import { createMassagedTemplatePackageJson } from "./utils/create-massaged-template-package-json";

/**
 * @public
 * @since %version%
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

    const files = await copyFiles(filesDir, ignoredFiles);

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
