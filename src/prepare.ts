import spawn from "nano-spawn";
import { findHooksFile } from "./utils/find-hooks-file";
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

export async function prepare(cwd: string, targetDir: string): Promise<void> {
    if (!isTemplateFolder(cwd)) {
        throw new Error(
            `Current directory is not a valid cloneman template (missing ".cloneman")`,
        );
    }

    const buildFile = await findHooksFile("build", cwd);

    if (buildFile === undefined) {
        throw new Error(
            `No build file found in ".cloneman". Tried: build.{js,mjs,ts,mts}`,
        );
    }

    await spawn("node", [buildFile, targetDir], {
        cwd,
        stdout: "inherit",
        stderr: "inherit",
    });
}
