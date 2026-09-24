import { type PartiallyManagedFile } from "../utils/partially-managed-file";

/**
 * cloneman template configuration.
 *
 * @public
 * @since v1.0.0
 */
export interface TemplateConfig {
    /** list of files managed by this template */
    managedFiles?: string[];

    /**
     * List of files that are partially managed by the template. These files
     * allow the template to maintain specific sections while preserving user
     * modifications outside those sections.
     *
     * Each partially managed file has:
     *
     * - `filename`: The file path relative to the template root.
     * - `include`: Specifies which parts of the file to manage using marker.
     *
     * The `include` field can be one of:
     *
     * - `{ above: string }`: Manage content above the specified marker.
     * - `{ below: string }`: Manage content below the specified marker.
     * - `{ block: { begin: string; end: string } }`: Manage content between begin and end markers.
     *
     * A partially managed file must contain a line where the marker specified
     * in the include occurs. It must occur exactly once.
     *
     * @example
     *
     * ```ts
     * {
     *     "partiallyManagedFiles": [
     *         {
     *             "name": ".gitignore",
     *             "include": {
     *                 "above": "# lines above are managed by cloneman"
     *             }
     *         }
     *     ]
     * }
     * ```
     *
     * @see https://github.com/Forsakringskassan/cloneman/blob/main/docs/api/configuration.md#partiallymanagedfiles
     */
    partiallyManagedFiles?: PartiallyManagedFile[];

    /** list of files ignored by this template */
    ignoredFiles?: string[];
    /**
     * List of files (or glob patterns) to remove from the application during
     * updates. All patterns are relative to the application root.
     *
     * Globs can be negated by prefixing with `!`,e.g. `["foo.*", "!foo.ts"]`
     * will remove all `foo.*` files except `foo.ts`.
     *
     * Files are removed before copying files from `managedFiles`.
     *
     * @example
     *
     * - Remove file by name: `["foo.js"]`
     * - Remove file by pattern: `["*.tsbuildinfo"]`
     * - Negate pattern: `["tsconfig.*", "!tsconfig.json"]`
     *
     * @since v1.19.0
     */
    removeFiles?: string[];
    /** list of dependencies (from package.json) to ignore */
    ignoredDependencies?: string[];
    /** List of dependencies that will be removed from application during update */
    uninstallDependencies?: string[];
}

/**
 * Normalized version of [[TemplateConfig]].
 *
 * @public
 * @since v1.0.0
 */
export interface NormalizedTemplateConfig {
    /** branding */
    [normalizedConfig]: true;
    /** list of files managed by this template */
    managedFiles: string[];
    /** list of files partially managed by this template. */
    partiallyManagedFiles: PartiallyManagedFile[];
    /** list of files ignored by this template */
    ignoredFiles: string[];
    /** list of files (or glob patterns) to remove from the application */
    removeFiles: string[];
    /** list of dependencies (from package.json) to ignore */
    ignoredDependencies: string[];
    /** List of dependencies that will be removed from application during update */
    uninstallDependencies: string[];
}

/**
 * @public
 */
export const normalizedConfig = Symbol("normalized-config");
