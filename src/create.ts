import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { readJsonFile } from "./utils";
import { isTemplatePackageJson } from "./utils/is-template";
import {
    type PackageJson,
    type TemplatePackageJson,
} from "./utils/package-json";

async function readTemplatePackage(
    appPath: string,
    templatePackage: string,
): Promise<[filesDir: string, packagejson: TemplatePackageJson]> {
    const templateDir = path.join(appPath, "node_modules", templatePackage);
    const filesDir = path.join(templateDir, "files");
    const pkgPath = path.join(templateDir, "package.json");

    const templatePkg = await readJsonFile<PackageJson | TemplatePackageJson>(
        pkgPath,
    );

    if (!isTemplatePackageJson(templatePkg)) {
        throw new Error(
            `Package ${templatePackage} is not a valid cloneman template package (missing "cloneman" field in package.json)`,
        );
    }

    return [filesDir, templatePkg];
}

/**
 * Returns `true` if the template package is a local tarball instead of NPM package name.
 */
function isTarball(templatePackage: string): boolean {
    return templatePackage.endsWith(".tgz");
}

function normalizeTemplatePackage(
    appPath: string,
    templatePackage: string,
): string {
    if (!isTarball(templatePackage) || path.isAbsolute(templatePackage)) {
        return templatePackage;
    }

    const absolutePath = path.resolve(templatePackage);
    return path.relative(appPath, absolutePath);
}

/**
 * @internal
 */
export async function create(options: {
    name: string;
    templatePackage: string;
    cwd: string;
    env?: Record<string, string>;
}): Promise<void> {
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
    let installedTemplatePackage;
    let templatePackageName: string;
    let templatePackageVersion: string;

    try {
        await spawn("npm", ["init", "--yes"], { cwd: appPath, env });
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
        const temporaryPackageJson = await readJsonFile<PackageJson>(
            path.join(appPath, "package.json"),
        );

        templatePackageName = Object.keys(
            temporaryPackageJson.devDependencies ?? {},
        )[0];

        templatePackageVersion =
            temporaryPackageJson.devDependencies?.[templatePackageName] ?? "";

        if (!templatePackageName) {
            throw new Error(
                "Failed to determine installed template package name from devDependencies",
            );
        }
        installedTemplatePackage = templatePackageName;
    } catch (err) {
        const message = err instanceof Error ? err.message : "unknown error";
        throw new Error(`Failed to install template package: ${message}`);
    }

    const [filesDir, { cloneman }] = await readTemplatePackage(
        appPath,
        installedTemplatePackage,
    );

    const templatePackageJson = await readJsonFile<PackageJson>(
        path.join(filesDir, "package.json"),
    );

    templatePackageJson.name = name;
    templatePackageJson.version = "0.0.0";
    templatePackageJson.description = "";

    templatePackageJson.devDependencies ??= {};

    templatePackageJson.devDependencies[templatePackageName] =
        templatePackageVersion;

    await fs.writeFile(
        path.join(appPath, "package.json"),
        JSON.stringify(templatePackageJson, null, 2),
        "utf-8",
    );
    await Promise.all(
        cloneman.boilerplateFiles.map((filename) =>
            fs.copyFile(
                path.join(filesDir, filename),
                path.join(appPath, filename),
            ),
        ),
    );
}
