import { type PackageJson } from "../../utils/package-json";

interface RenovateJson {
    ignoreDeps?: string[];
}

export function updateRenovateWithIgnoredDeps(
    renovateConfig: RenovateJson,
    pkg: PackageJson,
    templatePackageName: string,
): RenovateJson {
    /* the dependencies specified in the template renovate.json */
    const original = renovateConfig.ignoreDeps ?? [];

    /* the dependencies managed by the template */
    const { dependencies = {}, devDependencies = {} } = pkg;
    const all = [...Object.keys(dependencies), ...Object.keys(devDependencies)];
    const filtered = all.filter(
        (dependencyName) => dependencyName !== templatePackageName,
    );

    /* merge and sort the combined lists */
    const updated = Array.from(new Set([...original, ...filtered])).toSorted(
        (a, b) => a.localeCompare(b),
    );

    renovateConfig.ignoreDeps = updated;

    return renovateConfig;
}
