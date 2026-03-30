import spawn from "nano-spawn";
import { findHooksFile } from "./utils/find-hooks-file";
import { isTemplateFolder } from "./utils/is-template";

/**
 * @internal
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
