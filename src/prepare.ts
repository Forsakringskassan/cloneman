import fs from "node:fs/promises";
import path from "node:path";
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

    const buildFile = await findBuildFile(cwd);

    if (buildFile === undefined) {
        throw new Error(
            `No build file found in ".cloneman". Tried: build.{js,mjs,ts,mts}`,
        );
    }

    await spawn("node", [`.cloneman/${buildFile}`, targetDir], {
        cwd,
        stdout: "inherit",
        stderr: "inherit",
    });
}

async function findBuildFile(cwd: string): Promise<string | undefined> {
    const [match] = await Array.fromAsync(
        fs.glob("build.{js,mjs,ts,mts}", { cwd: path.join(cwd, ".cloneman") }),
    );
    return match;
}
