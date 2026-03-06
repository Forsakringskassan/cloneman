import { readJsonFile } from "../utils";
import { normalizeTemplateConfig } from "./normalize-template-config";
import {
    type NormalizedTemplateConfig,
    type TemplateConfig,
} from "./template-config";

/**
 * Read and normalize a template configuration file.
 *
 * @public
 * @since v1.0.0
 * @param filePath - Full path to configuration file.
 */
export async function readConfigFile(
    filePath: string,
): Promise<NormalizedTemplateConfig> {
    const parsed = await readJsonFile<TemplateConfig>(filePath);
    return normalizeTemplateConfig(parsed);
}
