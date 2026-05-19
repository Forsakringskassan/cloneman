import { findHookScriptPath } from "./find-hook-script-path";

/**
 * Get hook script in given directory.
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
 * @internal
 * @param hook - Name of the hook.
 * @param hooksDir - Directory to look for hooks in.
 * @returns Absolute path to the matching hook file, or throws an error if the hook was not found.
 */
export function getHookScriptPath(hook: string, hooksDir: string): string {
    const scriptPath = findHookScriptPath(hook, hooksDir);
    if (scriptPath === undefined) {
        throw new Error(`No "${hook}" hook found in "${hooksDir}"`);
    }
    return scriptPath;
}
