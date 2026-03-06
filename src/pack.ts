import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";

function getPackOutput(stdout: string): string {
    const fileName = JSON.parse(stdout)[0].filename as string;

    if (!fileName) {
        throw new Error("Failed to pack template: no output file name");
    }
    return fileName;
}

/**
 * @internal
 * Packs the prepared template into a tarball using `npm pack` and moves it to the specified target directory.
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
