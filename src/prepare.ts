import { Console } from "node:console";
import fs from "node:fs/promises";
import path from "node:path";
import { PassThrough } from "node:stream";
import { text } from "node:stream/consumers";
import { pathToFileURL } from "node:url";
import { BuildNoExportedFnError } from "./errors";
import { buildTemplate } from "./template";
import { type BuildContext } from "./types";
import { isTemplateFolder } from "./utils/is-template";

type BuildFunction = (
    this: void,
    context: BuildContext,
) => void | Promise<void>;

interface BuildModule {
    default?: BuildFunction;
    build?: BuildFunction;
}

async function importBuild(
    filePath: string,
): Promise<BuildFunction | undefined> {
    const mod = (await import(filePath)) as BuildModule;
    if (typeof mod.build === "function") {
        return mod.build;
    }
    if (typeof mod.default === "function") {
        return mod.default;
    }
    return undefined;
}

async function findBuildFile(templateDir: string): Promise<string | undefined> {
    const cwd = path.join(templateDir, ".cloneman");
    const [match] = await Array.fromAsync(
        fs.glob("build.{js,mjs,ts,mts}", { cwd }),
    );
    if (!match) {
        return undefined;
    }
    return pathToFileURL(path.join(cwd, match)).href;
}

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

    const buildFile = await findBuildFile(templateDir);

    if (buildFile === undefined) {
        throw new Error(
            `No build file found in ".cloneman". Tried: build.{js,mjs,ts,mts}`,
        );
    }

    const stream = new PassThrough();
    const logger = new Console({ stdout: stream, stderr: stream });

    try {
        const build = await importBuild(buildFile);
        if (!build) {
            throw new BuildNoExportedFnError({
                scriptPath: buildFile,
            });
        }
        await build({
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
