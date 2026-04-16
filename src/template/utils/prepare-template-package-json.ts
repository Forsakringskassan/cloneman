import { sortPackageJson } from "sort-package-json";
import { type PackageJson } from "../../utils/package-json";
import { isIgnored } from "./is-ignored";

/**
 * @internal
 * @param template - The generated `package.json`  for the template NPM package.
 * @param pkg - The `package.json` content of the template (from the root of the template).
 */
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

    return sortPackageJson(massaged);
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
