import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { type default as yoctoSpinner } from "yocto-spinner";
import { getStoredFileName } from "./template/utils";
import { type ClientMetadata } from "./types";
import {
    type ApplicationPackageJson,
    collectParameters,
    createInstallContext,
    getTemplateInfo,
    isClientMetadata,
    normalizeTemplatePackage,
    readJsonFile,
    runHook,
} from "./utils";

/**
 * @internal
 */
export async function create(options: {
    name: string;
    templatePackage: string;
    cwd: string;
    env?: Record<string, string>;
    parameters: Map<string, string>;
    spinner?: ReturnType<typeof yoctoSpinner>;
}): Promise<{ message: string }> {
    const {
        name,
        templatePackage,
        cwd,
        env = {},
        parameters: cliParameters,
        spinner,
    } = options;

    function text(newText: string): void {
        if (spinner) {
            spinner.text = newText;
        }
    }

    const appPath = path.join(cwd, name);
    if (existsSync(appPath)) {
        throw new Error("application dir already exists");
    }

    const normalizedTemplatePackage = normalizeTemplatePackage(
        appPath,
        templatePackage,
    );

    await fs.mkdir(appPath, { recursive: true });
    let templatePackageName: string;
    let templatePackageVersion: string;

    try {
        await spawn("npm", ["init", "--yes"], { cwd: appPath, env });

        text("Installing template...");
        await spawn(
            "npm",
            [
                "install",
                "--save-dev",
                "--save-exact",
                normalizedTemplatePackage,
            ],
            {
                cwd: appPath,
                env,
            },
        );

        /**
         * Temporary package.json created by npm init and is only used during the installation process
         * Will later be replaced with the actual template package.json
         */
        const tmpApplicationPackageJson =
            await readJsonFile<ApplicationPackageJson>(
                path.join(appPath, "package.json"),
            );

        templatePackageName = Object.keys(
            tmpApplicationPackageJson.devDependencies ?? {},
        )[0];

        templatePackageVersion =
            tmpApplicationPackageJson.devDependencies?.[templatePackageName] ??
            "";

        if (!templatePackageName) {
            throw new Error(
                "Failed to determine installed template package name from devDependencies",
            );
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : "unknown error";
        throw new Error(`Failed to install template package: ${message}`, {
            cause: err,
        });
    }

    const {
        filesDir,
        hooksDir,
        boilerplateFiles,
        parameters: parameterDefinitions,
    } = await getTemplateInfo(templatePackageName, appPath);

    if (spinner) {
        spinner.stop();
    }

    const parameters = await collectParameters({
        definitions: parameterDefinitions,
        existing: new Map(),
        overrides: cliParameters,
        interactive: process.stdin.isTTY,
    });

    if (spinner) {
        spinner.start();
    }

    const applicationPackageJson = await readJsonFile<ApplicationPackageJson>(
        path.join(filesDir, "package.json"),
    );

    /* sanity-check: ensure template have a proper cloneman field */
    if (!isClientMetadata(applicationPackageJson.cloneman)) {
        throw new TypeError(
            `Template "files/package.json" contains malformed "cloneman" field`,
        );
    }

    applicationPackageJson.name = name;
    applicationPackageJson.version = "0.0.0";
    applicationPackageJson.description = "";

    applicationPackageJson.devDependencies ??= {};
    applicationPackageJson.devDependencies[templatePackageName] =
        templatePackageVersion;

    applicationPackageJson.cloneman = {
        ...applicationPackageJson.cloneman,
        parameters: Object.fromEntries(parameters.entries()),
    } satisfies ClientMetadata;

    await fs.writeFile(
        path.join(appPath, "package.json"),
        JSON.stringify(applicationPackageJson, null, 2),
        "utf8",
    );
    text("Copying template files...");
    await Promise.all(
        boilerplateFiles.map((filename) => {
            return fs.cp(
                path.join(filesDir, getStoredFileName(filename)),
                path.join(appPath, filename),
                { recursive: true },
            );
        }),
    );

    let message = [`Now run:`, ``, `  cd ${name}`, `  npm install`].join("\n");

    if (hooksDir) {
        const context = createInstallContext({
            command: "create",
            targetDir: appPath,
            name,
            parameters,
            version: {
                oldVersion: null,
                newVersion: templatePackageVersion,
            },
            setMessage(text) {
                message = text;
            },
        });
        await runHook("install", hooksDir, context);
    }

    return { message };
}
