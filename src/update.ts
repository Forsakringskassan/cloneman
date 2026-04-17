import fs from "node:fs/promises";
import path from "node:path";
import type yoctoSpinner from "yocto-spinner";
import { InvalidClonemanFieldError, MissingClonemanFieldError } from "./errors";
import { getStoredFileName } from "./template/utils/get-stored-filename";
import {
    info,
    isClientMetadata,
    isTarball,
    readJsonFile,
    writeJsonFile,
} from "./utils";
import { fetchTarball } from "./utils/fetch-tarball";
import { filterDependencies } from "./utils/filter-dependencies";
import { type PackageJson } from "./utils/package-json";
import { parseTarball } from "./utils/parse-tarball";

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

    const applicationPackageJson = await readJsonFile<PackageJson>(
        path.join(cwd, "package.json"),
    );

    const { cloneman, name, version, description } = applicationPackageJson;
    if (cloneman === undefined) {
        throw new MissingClonemanFieldError();
    } else if (!isClientMetadata(cloneman)) {
        throw new InvalidClonemanFieldError(cloneman);
    }

    let tarballBuffer: Buffer;
    /*
     * The actual version is determined during the process
     * If the input is a tarball, the version is set to the relative path of the tarball, since it points to a local file.
     * If the input is a version, the version is set to the input version, or the resolved version if the input is "latest".
     */
    let packageJsonVersion: string;

    text("Retrieving template files...");
    if (isTarball(versionOrTar)) {
        packageJsonVersion = versionOrTar;

        const tarPath = path.isAbsolute(versionOrTar)
            ? versionOrTar
            : path.resolve(versionOrTar);
        try {
            tarballBuffer = await fs.readFile(tarPath);
        } catch {
            throw new Error(`Tarball not found at path "${tarPath}"`);
        }
        /* Version is a relative path to the tarball, since it points to a local file. */
        packageJsonVersion = path.relative(cwd, tarPath).replaceAll("\\", "/");
    } else {
        packageJsonVersion = versionOrTar;

        if (versionOrTar === "latest") {
            packageJsonVersion = await info<string>(
                `${cloneman.template}@${versionOrTar}`,
                {
                    field: "version",
                    env,
                },
            );
        }

        tarballBuffer = await fetchTarball(
            cloneman.template,
            packageJsonVersion,
            env,
        );
    }

    const { tmplPackageJson, tarballPackageJson, files } =
        await parseTarball(tarballBuffer);

    if (tarballPackageJson.name !== cloneman.template) {
        throw new Error(
            `Cannot update application: template package in tarball (${tarballPackageJson.name}) does not match current template package`,
        );
    }

    const { managedFiles, uninstallDependencies } = tarballPackageJson.cloneman;

    await Promise.all(
        managedFiles.map(async (filename) => {
            const tarEntryPath = `package/files/${getStoredFileName(filename)}`;
            const content = files.get(tarEntryPath);
            if (content === undefined) {
                throw new Error(
                    `Managed file "${filename}" not found in tarball`,
                );
            }
            const dest = path.join(cwd, filename);
            await fs.mkdir(path.dirname(dest), { recursive: true });
            await fs.writeFile(dest, content);
        }),
    );

    const dependencies = filterDependencies({
        appDependencies: applicationPackageJson.dependencies,
        templateDependencies: tmplPackageJson.dependencies,
        uninstallDependencies,
    });

    const devDependencies = filterDependencies({
        appDependencies: applicationPackageJson.devDependencies,
        templateDependencies: tmplPackageJson.devDependencies,
        uninstallDependencies,
    });

    await writeJsonFile(path.join(cwd, "package.json"), {
        ...tmplPackageJson,
        name,
        version,
        description,
        dependencies,
        devDependencies: {
            ...devDependencies,
            [cloneman.template]: packageJsonVersion,
        },
    });
}
