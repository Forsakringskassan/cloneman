import { Console } from "node:console";
import path from "node:path";
import { PassThrough } from "node:stream";
import { text } from "node:stream/consumers";
import { buildTemplate } from "./template";
import { type Parameter } from "./types";
import {
    getHookScriptPath,
    isTemplateFolder,
    runHook,
    updateJsonFile,
} from "./utils";

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

    /* this array is mutated directly by `buildTemplate()` */
    const parameters: Parameter[] = [];

    try {
        await runHook("build", hooksDir, {
            buildTemplate(name, config) {
                return buildTemplate({
                    logger,
                    name,
                    templateDir,
                    targetDir,
                    config: config ?? {},
                    parameters,
                });
            },
            templateDir,
            targetDir,
            logger,
        });
        if (parameters.length > 0) {
            const filePath = path.join(targetDir, "package.json");
            await updateJsonFile(filePath, {
                cloneman: {
                    parameters,
                },
            });
        }
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
