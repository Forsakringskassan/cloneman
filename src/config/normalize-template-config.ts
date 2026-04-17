import {
    type NormalizedTemplateConfig,
    type TemplateConfig,
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
        managedFiles: config.managedFiles ?? [],
        ignoredFiles: config.ignoredFiles ?? [],
        ignoredDependencies: config.ignoredDependencies ?? [],
        uninstallDependencies: config.uninstallDependencies ?? [],
    };
}
