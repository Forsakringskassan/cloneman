import path from "node:path";
/**
 * @internal
 * Returns `true` if the template package is a local tarball instead of NPM package name.
 */
export function isTarball(templatePackage: string): boolean {
    return templatePackage.endsWith(".tgz");
}

/**
 * @internal
 * Normalizes the template package string for installation. If it's a local tarball, it converts it to a relative path from the application directory.
 *
 * @param appPath - The path to the application directory.
 * @param templatePackage - The template package string, which can be an NPM package name or a path to a local tarball.
 * @returns
 */
export function normalizeTemplatePackage(
    appPath: string,
    templatePackage: string,
): string {
    if (!isTarball(templatePackage) || path.isAbsolute(templatePackage)) {
        return templatePackage;
    }

    const absolutePath = path.resolve(templatePackage);
    return path.relative(appPath, absolutePath);
}
