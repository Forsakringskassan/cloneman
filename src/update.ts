import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type yoctoSpinner from "yocto-spinner";
import { InvalidClonemanFieldError, MissingClonemanFieldError } from "./errors";
import { getStoredFileName } from "./template/utils";
import { type ClientMetadata } from "./types";
import {
    type PackageJson,
    type TemplatePackageJson,
    collectParameters,
    createInstallContext,
    fetchTarball,
    filterDependencies,
    info,
    isClientMetadata,
    isTarball,
    parseTarball,
    readJsonFile,
    runHook,
    writeJsonFile,
} from "./utils";

async function withTemporaryDirectory(
    cb: (dir: string) => void | Promise<void>,
): Promise<void> {
    const tempdir = await fs.realpath(os.tmpdir());
    const dir = path.join(tempdir, randomBytes(16).toString("hex"));
    await fs.mkdir(dir);
    try {
        await cb(dir);
    } finally {
        await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
    }
}

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

    const { cloneman, name, version, description } = appPackageJson;
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
        /* Version is a relative path to the tarball, since it points to a local file. */
        packageJsonVersion = path
            .relative(appDir, tarPath)
            .replaceAll("\\", "/");
    } else {
        packageJsonVersion = templateVersion;

        if (templateVersion === "latest") {
            packageJsonVersion = await info<string>(
                `${cloneman.template}@${templateVersion}`,
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

    /* sanity-check: ensure template have a proper cloneman field */
    if (!isClientMetadata(tmplPackageJson.cloneman)) {
        throw new TypeError(
            `Template "files/package.json" contains malformed "cloneman" field`,
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

    await writeJsonFile(
        path.join(appDir, "package.json"),
        {
            ...tmplPackageJson,
            name,
            version,
            keywords: appPackageJson.keywords ?? tmplPackageJson.keywords,
            homepage: appPackageJson.homepage ?? tmplPackageJson.homepage,
            bugs: appPackageJson.bugs ?? tmplPackageJson.bugs,
            repository: appPackageJson.repository ?? tmplPackageJson.repository,
            description,
            dependencies,
            devDependencies: {
                ...devDependencies,
                [cloneman.template]: packageJsonVersion,
            },
            cloneman: {
                ...tmplPackageJson.cloneman,
                parameters: Object.fromEntries(parameters),
            } satisfies ClientMetadata,
        },
        {
            indent: 2,
            trailer: "\n",
        },
    );

    let message = [`Now run:`, ``, `  npm install`].join("\n");

    /* create a temporary directory with the hooks we extracted from the tarball
     * and run hooks from there, as the hooks installed in `node_modules` right
     * now would be the old and not the current version */
    await withTemporaryDirectory(async (hooksDir) => {
        const hooks = Array.from(files.keys())
            .filter((it) => it.startsWith("package/hooks/"))
            .map((filePath) => {
                const dst = path.join(hooksDir, path.basename(filePath));
                const content = files.get(filePath)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- we know it will exist as we are looping over existing entries (let it crash if this assumption is false) */
                return fs.writeFile(dst, content);
            });
        await Promise.all(hooks);
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
    });

    return { message };
}
