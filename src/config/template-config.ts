/**
 * cloneman template configuration.
 *
 * @public
 * @since %version%
 */
export interface TemplateConfig {
    /** list of files managed by this template */
    managedFiles?: string[];
    /** list of files ignored by this template */
    ignoredFiles?: string[];
    /** list of dependencies (from package.json) to ignore */
    ignoredDependencies?: string[];
}

/**
 * Normalized version of [[TemplateConfig]].
 *
 * @public
 * @since %version%
 */
export interface NormalizedTemplateConfig {
    /** list of files managed by this template */
    managedFiles: string[];
    /** list of files ignored by this template */
    ignoredFiles: string[];
    /** list of dependencies (from package.json) to ignore */
    ignoredDependencies: string[];
}
