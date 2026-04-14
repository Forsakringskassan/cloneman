import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { isTemplateFolder } from "./utils/is-template";

/**
 * Prepares the target directory with a cloneman template by running the build script from the template's ".cloneman" folder.
 * This target directory could then by used for packing the template with `npm pack` or publish.
 *
 * @public
 * @since v1.4.0
 * @param options - The options for packing the template.
 *   - `cwd`: The current working directory where the tarball should be moved after packing.
 *   - `targetDir`: The directory where the `npm pack` command should be executed.
 */
export async function prepare(
    cwd: string,
    targetDir: string,
): Promise<{ output: string }> {
    if (!isTemplateFolder(cwd)) {
        throw new Error(
            `Current directory is not a valid cloneman template (missing ".cloneman")`,
        );
    }

    const buildFile = await findBuildFile(cwd);

    if (buildFile === undefined) {
        throw new Error(
            `No build file found in ".cloneman". Tried: build.{js,mjs,ts,mts}`,
        );
    }

    return await spawn("node", [`.cloneman/${buildFile}`, targetDir], {
        cwd,
        stdout: "pipe",
        stderr: "pipe",
    });
}

async function findBuildFile(cwd: string): Promise<string | undefined> {
    const [match] = await Array.fromAsync(
        fs.glob("build.{js,mjs,ts,mts}", { cwd: path.join(cwd, ".cloneman") }),
    );
    return match;
}
