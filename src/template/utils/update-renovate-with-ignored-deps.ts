import { type TemplateConfig } from "../../config";
import { type PackageJson, matchesPatterns } from "../../utils";

/**
 * @internal
 */
export interface RenovateJson {
    ignoreDeps?: string[];
}

export function updateRenovateWithIgnoredDeps(
    renovateConfig: RenovateJson,
    pkg: PackageJson,
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
    const {
        dependencies = {},
        devDependencies = {},
        peerDependencies = {},
    } = pkg;
    const all = [
        ...Object.keys(dependencies),
        ...Object.keys(devDependencies),
        ...Object.keys(peerDependencies),
    ];
    const filtered = all.filter(isManagedByTemplate);

    /* merge and sort the combined lists */
    const updated = Array.from(new Set([...original, ...filtered])).toSorted(
        (a, b) => a.localeCompare(b),
    );

    renovateConfig.ignoreDeps = updated;

    return renovateConfig;
}
