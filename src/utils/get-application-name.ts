/**
 * Get the application name, e.g. the `name` field in `package.json`.
 *
 * @internal
 */
export function getApplicationName(
    name: string,
    options: { unscoped: boolean },
): string {
    if (options.unscoped) {
        return name.replaceAll(/^@([^/]+)\//g, "");
    } else {
        return name;
    }
}
