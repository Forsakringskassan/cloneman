import { type TemplateConfig } from "../../config";
import { type PackageJson, matchesPatterns } from "../../utils";

/**
 * @internal
 */
export interface RenovateJson {
    ignoreDeps?: string[];
}

function getDependencyNames(pkg: PackageJson): string[] {
    const {
        dependencies = {},
        devDependencies = {},
        peerDependencies = {},
    } = pkg;
    return [
        ...Object.keys(dependencies),
        ...Object.keys(devDependencies),
        ...Object.keys(peerDependencies),
    ];
}

export function updateRenovateWithIgnoredDeps(
    renovateConfig: RenovateJson,
    packages: PackageJson[],
    templatePackageName: string,
    templateConfig: TemplateConfig,
): RenovateJson {
    const { ignoredDependencies: ignored = [] } = templateConfig;

    const isManagedByTemplate = (it: string): boolean => {
        /* the template itself is never managed */
        if (it === templatePackageName) {
            return false;
        }
        /* explicitly configured to not be managed */
        if (matchesPatterns(it, ignored)) {
            return false;
        }
        return true;
    };

    /* the dependencies specified in the template renovate.json */
    const original = renovateConfig.ignoreDeps ?? [];

    /* the dependencies managed by the template */
    const all = packages.flatMap(getDependencyNames);
    const filtered = all.filter(isManagedByTemplate);

    /* merge and sort the combined lists */
    const updated = Array.from(new Set([...original, ...filtered])).toSorted(
        (a, b) => a.localeCompare(b),
    );

    renovateConfig.ignoreDeps = updated;

    return renovateConfig;
}
