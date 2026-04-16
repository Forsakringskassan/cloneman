import fs from "node:fs/promises";
import path from "node:path";
import type yoctoSpinner from "yocto-spinner";
import { InvalidClonemanFieldError, MissingClonemanFieldError } from "./errors";
import { getStoredFileName } from "./template/utils/get-stored-filename";
import { info, isTarball, readJsonFile, writeJsonFile } from "./utils";
import { fetchTarball } from "./utils/fetch-tarball";
import { type PackageJson } from "./utils/package-json";
import { parseTarball } from "./utils/parse-tarball";

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
                `${templatePackage}@${versionOrTar}`,
                {
                    field: "version",
                    env,
                },
            );
        }

        tarballBuffer = await fetchTarball(
            templatePackage,
            packageJsonVersion,
            env,
        );
    }

    const { packageJson: templatePkgJson, files } =
        await parseTarball(tarballBuffer);

    if (templatePkgJson.name !== templatePackage) {
        throw new Error(
            `Cannot update application: template package in tarball (${templatePkgJson.name}) does not match current template package`,
        );
    }

    const { managedFiles } = templatePkgJson.cloneman;

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

    await writeJsonFile(path.join(cwd, "package.json"), {
        ...packageJson,
        devDependencies: {
            ...packageJson.devDependencies,
            [templatePackage]: packageJsonVersion,
        },
    });
}
