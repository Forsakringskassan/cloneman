import { matchesGlob } from "node:path";

/**
 * Computes the final set of dependencies for an application after a template update.
 *
 * Template-owned dependencies are always updated to the versions the template dictates.
 * Any dependencies the template wants to remove (e.g. packages replaced by newer alternatives)
 * are dropped from the application entirely.
 *
 * @internal
 * @param options - Options for computing the merged dependency set.
 *  - `appDependencies`: the current application's dependencies,
 *  - `templateDependencies`: the dependencies owned by the template,
 *  - `uninstallDependencies`: an optional list of names or glob patterns to remove from the application, and
 *  - `ignoredDependencies`: an optional list of names or glob patterns to remove from the template dependencies.
 */
export function filterDependencies(options: {
    appDependencies: Partial<Record<string, string>> | undefined;
    templateDependencies: Partial<Record<string, string>> | undefined;
    uninstallDependencies: string[] | undefined;
    ignoredDependencies: string[] | undefined;
}): Partial<Record<string, string>> {
    const {
        appDependencies = {},
        templateDependencies = {},
        uninstallDependencies = [],
        ignoredDependencies = [],
    } = options;
    const ignore = ignoredDependencies;
    const shouldIgnore = (key: string): boolean =>
        ignore.some((pattern) => matchesGlob(key, pattern));
    const filteredTemplateDependencies = Object.fromEntries(
        Object.entries(templateDependencies).filter(
            ([key]) => !shouldIgnore(key),
        ),
    );
    const templateKeys = new Set(Object.keys(filteredTemplateDependencies));
    const uninstall = uninstallDependencies;

    const shouldUninstall = (key: string): boolean =>
        uninstall.some((pattern) => matchesGlob(key, pattern));

    const inTemplate = (key: string): boolean => templateKeys.has(key);

    const keepDependency = (key: string): boolean =>
        !inTemplate(key) && !shouldUninstall(key);

    const entries = Object.entries(appDependencies).filter(([key]) =>
        keepDependency(key),
    );

    const filtered = Object.fromEntries(entries);

    return { ...filtered, ...filteredTemplateDependencies };
}
