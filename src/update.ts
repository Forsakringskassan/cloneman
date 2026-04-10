import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import type yoctoSpinner from "yocto-spinner";
import { getStoredFileName } from "./template/utils/get-stored-filename";
import {
    getTemplateInfo,
    isTarball,
    normalizeTemplatePackage,
    readJsonFile,
    readPackageJsonFromTarball,
} from "./utils";

import { type PackageJson } from "./utils/package-json";
import { runTemplateInstall } from "./utils/run-template-install";

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

    await runTemplateInstall({
        installScriptPath: path.join(
            cwd,
            "node_modules",
            templatePackage,
            ".cloneman",
            "install.mjs",
        ),
        cwd,
        env,
    });
}
