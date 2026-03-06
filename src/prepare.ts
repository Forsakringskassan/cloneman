import spawn from "nano-spawn";
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

    await spawn("node", [".cloneman/build.mjs", targetDir], {
        cwd,
        stdout: "inherit",
        stderr: "inherit",
    });
}
