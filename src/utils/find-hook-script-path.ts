import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Finds a hook script in given directory.
 *
 * Looks for the first matching file with one of the supported extensions:
 *
 * - `js`
 * - `cjs`
 * - `mjs`
 * - `ts`
 * - `cts`
 * - `mts`
 *
 * If the same hook exists with multiple filename the first one is silently
 * returned. It is undefined behaviour which one is considered first.
 *
 * @internal
 * @param hook - Name of the hook.
 * @param hooksDir - Directory to look for hooks in.
 * @returns Absolute path to the matching hook file, or `undefined` if no file exists.
 */
export function findHookScriptPath(
    hook: string,
    hooksDir: string,
): string | undefined {
    const pattern = `${hook}.{js,cjs,mjs,ts,cts,mts}`;
    const result = fs.globSync(pattern, {
        cwd: hooksDir,
    });
    const [match] = result;
    if (!match) {
        return undefined;
    }
    return pathToFileURL(path.join(hooksDir, match)).href;
}
