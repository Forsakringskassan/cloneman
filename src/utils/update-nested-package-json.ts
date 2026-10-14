import { filterDependencies } from "./filter-dependencies";
import { type FindPackageJsonResult } from "./find-package-json";
import { type PackageJson } from "./package-json";

/**
 * Updates dependencies in a nested package.json.
 *
 * @internal
 */
export function updateNestedPackageJson(
    nestedPackageJson: FindPackageJsonResult,
    currentSubPackageJson: PackageJson,
    uninstallDependencies: string[],
    ignoredDependencies: string[],
    onlyDevDependencies: boolean,
): PackageJson {
    const sourceJson = onlyDevDependencies
        ? currentSubPackageJson
        : nestedPackageJson.packageJson;

    const massagedSubPackageJson = { ...sourceJson };

    massagedSubPackageJson.dependencies = filterDependencies({
        appDependencies: currentSubPackageJson.dependencies,
        templateDependencies: nestedPackageJson.packageJson.dependencies,
        uninstallDependencies,
        ignoredDependencies,
    });

    massagedSubPackageJson.devDependencies = filterDependencies({
        appDependencies: currentSubPackageJson.devDependencies,
        templateDependencies: nestedPackageJson.packageJson.devDependencies,
        uninstallDependencies,
        ignoredDependencies,
    });

    return massagedSubPackageJson;
}
