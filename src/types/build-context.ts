import { type Console } from "node:console";
import { type NormalizedTemplateConfig, type TemplateConfig } from "../config";
import { type BuildTemplateResult } from "../template";

/**
 * The `context` parameter for the build scripts in `.cloneman/build.mts`.
 *
 * @public
 * @since v1.9.0
 */
export interface BuildContext {
    /**
     * Builds a cloneman template.
     *
     * @param name - The name to publish this package as.
     * @param config - Template configuration.
     */
    buildTemplate(
        this: void,
        name: string,
        config?: TemplateConfig | NormalizedTemplateConfig,
    ): Promise<BuildTemplateResult>;

    /**
     * A console instance to be used for logging (do not log directly on stdout
     * or stderr).
     */
    readonly logger: Console;

    /**
     * The output directory where files will be written.
     */
    readonly targetDir: string;

    /**
     * The template directory, typically the root directory of the template
     * repository.
     */
    readonly templateDir: string;
}
