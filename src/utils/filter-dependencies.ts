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
 *  - `templateDependencies`: the dependencies owned by the template, and
 *  - `uninstallDependencies`: an optional list of names or glob patterns to remove from the application.
 */
export function filterDependencies(options: {
    appDependencies: Partial<Record<string, string>> | undefined;
    templateDependencies: Partial<Record<string, string>> | undefined;
    uninstallDependencies: string[] | undefined;
}): Partial<Record<string, string>> {
    const { appDependencies, templateDependencies, uninstallDependencies } =
        options;
    const templateKeys = new Set(Object.keys(templateDependencies ?? {}));
    const uninstall = uninstallDependencies ?? [];

    const shouldUninstall = (key: string): boolean =>
        uninstall.some((pattern) => matchesGlob(key, pattern));

    const inTemplate = (key: string): boolean => templateKeys.has(key);

    const keepDependency = (key: string): boolean =>
        !inTemplate(key) && !shouldUninstall(key);

    const entries = Object.entries(appDependencies ?? {}).filter(([key]) =>
        keepDependency(key),
    );

    const filtered = Object.fromEntries(entries);

    return { ...filtered, ...templateDependencies };
}
