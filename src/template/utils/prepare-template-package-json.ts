import path from "node:path";
import { sortPackageJson } from "sort-package-json";
import { type PackageJson } from "../../utils/package-json";

export function prepareTemplatePackageJson(
    template: PackageJson,
    pkg: PackageJson,
    ignoredDepecencies: string[],
): PackageJson {
    const massaged = {
        ...pkg,
        name: "${name}",
        description: "${description}",
        version: "${version}",
        cloneman: template.name,
        dependencies: filterDependencies(pkg.dependencies, ignoredDepecencies),
        devDependencies: {
            ...filterDependencies(pkg.devDependencies, ignoredDepecencies),
            [template.name]: template.version,
        },
    } satisfies PackageJson;
    delete massaged.devDependencies["cloneman"];

    return sortPackageJson(massaged);
}

function isIgnored(key: string, ignored: string[]): boolean {
    return ignored.some((pattern) => path.matchesGlob(key, pattern));
}

function filterDependencies(
    dependencies: Record<string, string> | undefined,
    ignored: string[],
): Record<string, string> {
    if (!dependencies) {
        return {};
    }
    const deps = Object.entries(dependencies).filter(([key]) => {
        return !isIgnored(key, ignored);
    });

    return Object.fromEntries(deps);
}
