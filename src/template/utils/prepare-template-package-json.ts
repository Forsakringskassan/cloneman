import { sortPackageJson } from "sort-package-json";
import { BUILD_REMOVE_FIELDS } from "../../properties";
import { type PackageJson } from "../../utils";

/**
 * @internal
 * @param template - The generated `package.json`  for the template NPM package.
 * @param pkg - The `package.json` content of the template (from the root of the template).

 */
export function prepareTemplatePackageJson(
    template: PackageJson,
    pkg: PackageJson,
): PackageJson {
    const shallowCopy = { ...pkg };
    for (const field of BUILD_REMOVE_FIELDS) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Not user input
        delete shallowCopy[field as keyof PackageJson];
    }

    const massaged = {
        ...shallowCopy,
        name: "${name}",
        version: "${version}",

        dependencies: filterDependencies(shallowCopy.dependencies),
        devDependencies: {
            ...filterDependencies(shallowCopy.devDependencies),
            [template.name]: template.version,
        },
    } satisfies PackageJson;

    return sortPackageJson(massaged);
}

function filterDependencies(
    dependencies: Partial<Record<string, string>> | undefined,
): Partial<Record<string, string>> {
    if (!dependencies) {
        return {};
    }
    const deps = Object.entries(dependencies);

    return Object.fromEntries(deps);
}
