import fs from "node:fs/promises";
import path from "node:path";

/**
 * Finds a hook file in a template's `.cloneman` directory.
 *
 * Looks for the first matching file with one of the supported extensions:
 * `${fileName}.{js,mjs,ts,mts}`.
 *
 * @returns Absolute path to the matching hook file, or `undefined` if no file exists.
 * @internal
 */
export async function findHooksFile(
    fileName: string,
    cwd: string,
): Promise<string | undefined> {
    const hooksDir = path.join(cwd, ".cloneman");
    const [match] = await Array.fromAsync(
        fs.glob(`${fileName}.{js,mjs,ts,mts}`, {
            cwd: hooksDir,
        }),
    );
    return match ? path.join(hooksDir, match) : undefined;
}
