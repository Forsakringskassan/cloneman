import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";

interface PackStructure {
    filename: string;
}

type Npm11PackOutput = [PackStructure];
type Npm12PackOutput = Record<string, PackStructure>;

function getPackOutput(stdout: string): string {
    /* npm 11 returns an array, npm 12 returns object directly */
    const parsed = JSON.parse(stdout) as Npm11PackOutput | Npm12PackOutput;
    const { filename } = Array.isArray(parsed)
        ? parsed[0]
        : Object.values(parsed)[0];
    if (!filename) {
        throw new Error("Failed to pack template: no output file name");
    }
    return filename;
}

/**
 * Packs the prepared template into a tarball using `npm pack` and moves it to the specified target directory.
 *
 * @public
 * @since v1.3.0
 * @param options - The options for packing the template.
 *   - `cwd`: The current working directory where the tarball should be moved after packing.
 *   - `targetDir`: The directory where the `npm pack` command should be executed.
 *   - `env`: Optional environment variables to pass to the `npm pack` command.
 */
export async function pack(options: {
    cwd: string;
    targetDir: string;
    env?: Record<string, string>;
}): Promise<void> {
    const { cwd, targetDir, env = {} } = options;
    try {
        const result = await spawn("npm", ["pack", "--json"], {
            cwd: targetDir,
            env,
            stderr: "inherit",
        });

        const fileName = getPackOutput(result.stdout);

        await fs.rename(
            path.join(targetDir, fileName),
            path.join(cwd, fileName),
        );
    } catch (err) {
        console.error("Failed to pack template:", err);
        throw err;
    }
}
