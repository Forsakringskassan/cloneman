import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { type default as yoctoSpinner } from "yocto-spinner";
import { getStoredFileName } from "./template/utils/get-stored-filename";
import {
    getApplicationName,
    getApplicationSelector,
    getApplicationSlug,
    readJsonFile,
    runHook,
    updateJsonFile,
    writeJsonFile,
} from "./utils";
import { getTemplateInfo } from "./utils/get-template-info";
import { normalizeTemplatePackage } from "./utils/normalize-template-package";
import { type ApplicationPackageJson } from "./utils/package-json";

/**
 * @internal
 */
export async function create(options: {
    name: string;
    templatePackage: string;
    cwd: string;
    env?: Record<string, string>;
    spinner?: ReturnType<typeof yoctoSpinner>;
}): Promise<void> {
    function text(newText: string): void {
        if (options.spinner) {
            options.spinner.text = newText;
        }
    }

    const { name, templatePackage, cwd, env = {} } = options;
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
        throw new Error(`Failed to install template package: ${message}`);
    }

    const { filesDir, hooksDir, boilerplateFiles } = await getTemplateInfo(
        templatePackageName,
        appPath,
    );

    const applicationPackageJson = await readJsonFile<ApplicationPackageJson>(
        path.join(filesDir, "package.json"),
    );

    applicationPackageJson.name = name;
    applicationPackageJson.version = "0.0.0";
    applicationPackageJson.description = "";

    applicationPackageJson.devDependencies ??= {};

    applicationPackageJson.devDependencies[templatePackageName] =
        templatePackageVersion;

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

    if (hooksDir) {
        await runHook("install", hooksDir, {
            targetDir: appPath,
            logger: console,
            version: {
                oldVersion: null,
                newVersion: templatePackageVersion,
            },
            getApplicationName(options) {
                return getApplicationName(name, {
                    unscoped: false,
                    ...options,
                });
            },
            getApplicationSlug() {
                return getApplicationSlug(name);
            },
            getApplicationSelector() {
                return getApplicationSelector(name);
            },
            readFile(filePath) {
                return fs.readFile(path.join(appPath, filePath), "utf8");
            },
            readJsonFile<T>(filePath: string) {
                return readJsonFile<T>(path.join(appPath, filePath));
            },
            writeFile(filePath, content) {
                return fs.writeFile(
                    path.join(appPath, filePath),
                    content,
                    "utf8",
                );
            },
            writeJsonFile(filePath, content) {
                return writeJsonFile(path.join(appPath, filePath), content);
            },
            updateJsonFile(filePath, content) {
                return updateJsonFile(path.join(appPath, filePath), content);
            },
        });
    }
}
