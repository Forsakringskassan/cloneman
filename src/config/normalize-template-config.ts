import {
    type NormalizedTemplateConfig,
    type TemplateConfig,
    normalizedConfig,
} from "./template-config";

/**
 * Normalize a template configuration file.
 *
 * @internal
 */
export function normalizeTemplateConfig(
    config: TemplateConfig,
): NormalizedTemplateConfig {
    return {
        [normalizedConfig]: true,
        managedFiles: config.managedFiles ?? [],
        ignoredFiles: config.ignoredFiles ?? [],
        ignoredDependencies: config.ignoredDependencies ?? [],
        uninstallDependencies: config.uninstallDependencies ?? [],
    };
}
