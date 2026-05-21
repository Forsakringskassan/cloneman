import { getApplicationSlug } from "./get-application-slug";

/**
 * Returns a CSS class selector derived from the application name.
 *
 * @internal
 */
export function getApplicationSelector(name: string): string {
    const slug = getApplicationSlug(name);
    return `.${slug}`;
}
