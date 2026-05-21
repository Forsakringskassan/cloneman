/**
 * Returns a slug derived from the application name.
 *
 * - `foo` becomes `foo`
 * - `@scope/foo` becomes `scope--foo`.
 * - name is lowercased
 * - all non-alphanumeric characters except for hyphens and underscores are removed.
 *
 * @internal
 */
export function getApplicationSlug(name: string): string {
    return name
        .toLowerCase()
        .replaceAll(/^@([^/]+)\//g, "$1--")
        .replaceAll(/[^\d_a-z-]/g, "");
}
