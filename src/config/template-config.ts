/**
 * cloneman template configuration.
 *
 * @public
 * @since v1.0.0
 */
export interface TemplateConfig {
    /** list of files managed by this template */
    managedFiles?: string[];
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
     * @since %version%
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
