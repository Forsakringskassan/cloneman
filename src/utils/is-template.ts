import { existsSync } from "node:fs";
import path from "node:path";
import { type PackageJson, type TemplatePackageJson } from "./package-json";

/**
 * Checks if the given package JSON is a template package.
 * @param templatePkg - The package JSON to check.
 * @returns True if the package JSON is a template package, false otherwise.
 */
export function isTemplatePackageJson(
    templatePkg: PackageJson | TemplatePackageJson,
): templatePkg is TemplatePackageJson {
    return (templatePkg as PackageJson).cloneman !== undefined;
}

/**
 * Checks if the given folder is a template folder.
 * @param cwd - The current working directory to check.
 * @returns True if the folder is a template folder, false otherwise.
 */
export function isTemplateFolder(cwd: string): boolean {
    if (existsSync(path.join(cwd, ".cloneman"))) {
        return true;
    }
    return false;
}
