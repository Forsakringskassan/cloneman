import {
    type NormalizedTemplateConfig,
    type TemplateConfig,
    normalizedConfig,
} from "./template-config";

function isNormalized(
    config: TemplateConfig | NormalizedTemplateConfig,
): config is NormalizedTemplateConfig {
    return normalizedConfig in config;
}

/**
 * Normalize a template configuration file.
 *
 * @internal
 */
export function normalizeTemplateConfig(
    config: TemplateConfig | NormalizedTemplateConfig,
): NormalizedTemplateConfig {
    if (isNormalized(config)) {
        return config;
    }
    return {
        [normalizedConfig]: true,
        managedFiles: config.managedFiles ?? [],
        ignoredFiles: config.ignoredFiles ?? [],
        ignoredDependencies: config.ignoredDependencies ?? [],
        uninstallDependencies: config.uninstallDependencies ?? [],
    };
}
