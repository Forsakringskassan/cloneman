import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import type yoctoSpinner from "yocto-spinner";
import { InvalidClonemanFieldError, MissingClonemanFieldError } from "./errors";
import { getStoredFileName } from "./template/utils/get-stored-filename";
import {
    getTemplateInfo,
    isTarball,
    normalizeTemplatePackage,
    readJsonFile,
    readPackageJsonFromTarball,
} from "./utils";

import { type PackageJson } from "./utils/package-json";

function isValidTemplateName(value: unknown): value is string {
    return typeof value === "string" && value.trim() !== "";
}

/**
 * @internal
 */
export async function update(
    cwd: string,
    versionOrTar: string,
    env: Record<string, string> = {},
    spinner?: ReturnType<typeof yoctoSpinner>,
): Promise<void> {
    function text(newText: string): void {
        if (spinner) {
            spinner.text = newText;
        }
    }

    const packageJson = await readJsonFile<PackageJson>(
        path.join(cwd, "package.json"),
    );

    const { cloneman } = packageJson;
    if (cloneman === undefined) {
        throw new MissingClonemanFieldError();
    } else if (!isValidTemplateName(cloneman)) {
        throw new InvalidClonemanFieldError(cloneman);
    }
    const templatePackage = cloneman;

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

    text("Installing dependencies...");
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
            return fs.cp(
                path.join(filesDir, getStoredFileName(filename)),
                path.join(cwd, filename),
                { recursive: true },
            );
        }),
    );
}
