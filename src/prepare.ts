import { Console } from "node:console";
import path from "node:path";
import { PassThrough } from "node:stream";
import { text } from "node:stream/consumers";
import { buildTemplate } from "./template";
import { getHookScriptPath, runHook } from "./utils";
import { isTemplateFolder } from "./utils/is-template";

/**
 * Prepares the target directory with a cloneman template by running the build script from the template's ".cloneman" folder.
 * This target directory could then by used for packing the template with `npm pack` or publish.
 *
 * @public
 * @since v1.4.0
 * @param templateDir - The template directory, typically the root directory of the template repository.
 * @param targetDir - The output directory where files will be written.
 */
export async function prepare(
    templateDir: string,
    targetDir: string,
): Promise<{ output: string }> {
    if (!isTemplateFolder(templateDir)) {
        throw new Error(
            `"${templateDir}" is not a valid cloneman template (missing ".cloneman")`,
        );
    }

    const hooksDir = path.join(templateDir, ".cloneman");
    const buildFile = getHookScriptPath("build", hooksDir);
    const stream = new PassThrough();
    const logger = new Console({ stdout: stream, stderr: stream });

    try {
        await runHook("build", hooksDir, {
            buildTemplate(name, config) {
                return buildTemplate({
                    logger,
                    name,
                    templateDir,
                    targetDir,
                    config: config ?? {},
                });
            },
            templateDir,
            targetDir,
            logger,
        });
    } catch (err) {
        stream.end();
        const output = await text(stream);
        console.error(`Failed to run build script at "${buildFile}":`, output);
        throw err;
    }

    stream.end();
    const output = await text(stream);
    return { output };
}
