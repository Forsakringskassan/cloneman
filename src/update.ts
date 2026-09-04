import fs from "node:fs/promises";
import path from "node:path";
import type yoctoSpinner from "yocto-spinner";
import { InvalidClonemanFieldError, MissingClonemanFieldError } from "./errors";
import { getStoredFileName } from "./template/utils";
import {
    type PackageJson,
    type TemplatePackageJson,
    collectParameters,
    createInstallContext,
    createUpdatedPackageJson,
    fetchTarball,
    filterDependencies,
    getTemplateInfo,
    info,
    isClientMetadata,
    isTarball,
    parseTarball,
    readJsonFile,
    runHook,
    withTemporaryTarBallDirectory,
    writeJsonFile,
} from "./utils";

async function removeFiles(
    cloneman: Partial<TemplatePackageJson["cloneman"]>,
    { cwd }: { cwd: string },
): Promise<void> {
    /* eslint-disable-next-line unicorn/no-non-function-verb-prefix -- cannot be changed until next major */
    const { removeFiles } = cloneman;
    if (!removeFiles) {
        return;
    }
    const include = removeFiles.filter((it) => !it.startsWith("!"));
    const exclude = removeFiles
        .filter((it) => it.startsWith("!"))
        .map((it) => it.slice(1));
    const iterator = fs.glob(include, { cwd });
    const filenames = await Array.fromAsync(iterator);
    await Promise.all(
        filenames.map(async (it) => {
            if (exclude.some((pattern) => path.matchesGlob(it, pattern))) {
                return;
            }
            const filename = path.join(cwd, it);
            await fs.unlink(filename);
        }),
    );
}

async function copyFiles(
    files: Map<string, Buffer>,
    cloneman: Partial<TemplatePackageJson["cloneman"]>,
    { cwd }: { cwd: string },
): Promise<void> {
    const { managedFiles } = cloneman;
    if (!managedFiles) {
        return;
    }
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
}

/**
 * @internal
 */
export async function update(options: {
    cwd: string;
    version: string;
    env: Record<string, string>;
    parameters: Map<string, string>;
    spinner?: ReturnType<typeof yoctoSpinner>;
}): Promise<{ message: string }> {
    const {
        cwd: appDir,
        version: templateVersion,
        env,
        parameters: cliParameters,
        spinner,
    } = options;

    async function text(
        newText: string,
        cb?: () => void | Promise<void>,
    ): Promise<void> {
        if (spinner) {
            spinner.text = newText;
        }
        if (cb) {
            await cb();
        }
    }

    const appPackageJson = await readJsonFile<PackageJson>(
        path.join(appDir, "package.json"),
    );

    const { cloneman, name } = appPackageJson;
    if (cloneman === undefined) {
        throw new MissingClonemanFieldError();
    }
    if (!isClientMetadata(cloneman)) {
        throw new InvalidClonemanFieldError(cloneman);
    }

    let tarballBuffer: Buffer;
    /*
     * The actual version is determined during the process
     * If the input is a tarball, the version is set to the relative path of the tarball, since it points to a local file.
     * If the input is a version, the version is set to the input version, or the resolved version if the input is "latest".
     */
    let packageJsonVersion: string;

    await text("Retrieving template files...");
    if (isTarball(templateVersion)) {
        const tarPath = path.isAbsolute(templateVersion)
            ? templateVersion
            : path.resolve(templateVersion);
        try {
            tarballBuffer = await fs.readFile(tarPath);
        } catch {
            throw new Error(`Tarball not found at path "${tarPath}"`);
        }
    } else {
        packageJsonVersion = templateVersion;

        if (templateVersion === "latest") {
            /* npm 11 returns string, npm 12 returns array with a single string */
            const version = await info<string | [string]>(
                `${cloneman.template}@${templateVersion}`,
                {
                    field: "version",
                    env,
                },
            );
            packageJsonVersion = Array.isArray(version) ? version[0] : version;
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

    const {
        uninstallDependencies,
        ignoredDependencies,
        parameters: parameterDefinitions,
    } = tarballPackageJson.cloneman;

    if (spinner) {
        spinner.stop();
    }

    const parameters = await collectParameters({
        definitions: parameterDefinitions ?? [],
        existing: new Map(Object.entries(cloneman.parameters ?? {})),
        overrides: cliParameters,
        interactive: process.stdin.isTTY,
    });

    if (spinner) {
        spinner.start();
    }

    await text("Removing obsolete files", () => {
        return removeFiles(tarballPackageJson.cloneman, { cwd: appDir });
    });

    await text("Copying managed files", () => {
        return copyFiles(files, tarballPackageJson.cloneman, { cwd: appDir });
    });

    const dependencies = filterDependencies({
        appDependencies: appPackageJson.dependencies,
        templateDependencies: tmplPackageJson.dependencies,
        uninstallDependencies,
        ignoredDependencies,
    });

    const devDependencies = filterDependencies({
        appDependencies: appPackageJson.devDependencies,
        templateDependencies: tmplPackageJson.devDependencies,
        uninstallDependencies,
        ignoredDependencies,
    });

    let message = [`Now run:`, ``, `  npm install`].join("\n");

    await withTemporaryTarBallDirectory(
        async (templateDir, index) => {
            const { fileHash } = await getTemplateInfo(index, appDir);

            const finalPackageJson = createUpdatedPackageJson({
                currentPackageJson: appPackageJson,
                templatePackageJson: tmplPackageJson,
                tarballPackageJson,
                dependencies,
                devDependencies,
                parameters,
                fileHash,
            });

            await writeJsonFile(
                path.join(appDir, "package.json"),
                finalPackageJson,
                {
                    indent: 2,
                    trailer: "\n",
                },
            );

            const hooksDir = path.join(templateDir, "hooks");
            const context = createInstallContext({
                command: "update",
                targetDir: appDir,
                name,
                parameters,
                version: {
                    oldVersion: cloneman.version,
                    newVersion: tmplPackageJson.version,
                },
                setMessage(text) {
                    message = text;
                },
            });
            await runHook("install", hooksDir, context);
        },
        {
            files,
        },
    );

    return { message };
}
