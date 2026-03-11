import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { getStoredFileName } from "./template/utils/get-stored-filename";
import {
    getTemplateInfo,
    isTarball,
    normalizeTemplatePackage,
    readJsonFile,
    readPackageJsonFromTarball,
} from "./utils";

import { type PackageJson } from "./utils/package-json";
/**
 * @internal
 */
export async function update(
    cwd: string,
    versionOrTar: string,
    env: Record<string, string> = {},
): Promise<void> {
    console.log(`Updating template package to version ${versionOrTar}...`);

    const packageJson = await readJsonFile<PackageJson>(
        path.join(cwd, "package.json"),
    );

    if (!packageJson.cloneman) {
        throw new Error(
            "Cannot update application: missing 'cloneman' field in package.json",
        );
    }
    const templatePackage = packageJson.cloneman as string;

    let template = `${templatePackage}@${versionOrTar}`;
    if (isTarball(versionOrTar)) {
        const tarPath = normalizeTemplatePackage(cwd, versionOrTar);

        const templatePackageJson = await readPackageJsonFromTarball(tarPath);

        if (templatePackageJson.name !== packageJson.cloneman) {
            throw new Error(
                `Cannot update application: template package in tarball (${templatePackageJson.name}) does not match current template package`,
            );
        }

        template = tarPath;
    }

    await spawn("npm", ["install", "--save-dev", "--save-exact", template], {
        cwd,
        env,
    });

    const [filesDir, , managedFiles] = await getTemplateInfo(
        templatePackage,
        cwd,
    );

    await Promise.all(
        managedFiles.map((filename) => {
            console.log(filename);
            return fs.copyFile(
                path.join(filesDir, getStoredFileName(filename)),
                path.join(cwd, filename),
            );
        }),
    );
}
