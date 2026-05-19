import { type HookMapping } from "../hooks";
import { findHookScriptPath } from "./find-hook-script-path";
import { importHook } from "./import-hook";

/**
 * Run a hook.
 *
 * @internal
 * @param hook - Hook name.
 * @param hooksDir - Directory to search for hook script in.
 * @returns A promise resolved with the return value of the hook or `undefined` if no hook was found.
 */
export async function runHook<K extends keyof HookMapping>(
    hook: K,
    hooksDir: string,
    ...args: Parameters<HookMapping[K]>
): Promise<Awaited<ReturnType<HookMapping[K]>> | undefined> {
    const scriptPath = findHookScriptPath(hook, hooksDir);
    if (!scriptPath) {
        return;
    }
    const fn = (await importHook(hook, scriptPath)) as (
        ...args: Parameters<HookMapping[K]>
    ) => ReturnType<HookMapping[K]>;
    return await fn(...args);
}
