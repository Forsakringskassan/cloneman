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
    /** list of dependencies (from package.json) to ignore */
    ignoredDependencies: string[];
    /** List of dependencies that will be removed from application during update */
    uninstallDependencies: string[];
}

/**
 * @public
 */
export const normalizedConfig = Symbol("normalized-config");
