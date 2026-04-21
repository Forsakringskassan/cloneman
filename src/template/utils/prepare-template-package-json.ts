import { sortPackageJson } from "sort-package-json";
import { type ClientMetadata } from "../../types";
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
): PackageJson {
    const cloneman: ClientMetadata = {
        template: template.name,
        version: pkg.version,
    };

    const massaged = {
        ...pkg,
        name: "${name}",
        description: "${description}",
        version: "${version}",
        cloneman,
        dependencies: filterDependencies(pkg.dependencies),

        devDependencies: {
            ...filterDependencies(pkg.devDependencies),
            [template.name]: template.version,
        },
    } satisfies PackageJson;

    return sortPackageJson(massaged);
}

function filterDependencies(
    dependencies: Partial<Record<string, string>> | undefined,
): Partial<Record<string, string>> {
    const depsToRemove = ["cloneman"];

    if (!dependencies) {
        return {};
    }
    const deps = Object.entries(dependencies).filter(([key]) => {
        return !isIgnored(key, depsToRemove);
    });

    return Object.fromEntries(deps);
}
