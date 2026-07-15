import { HookNoExportedFnError } from "../errors";
import { type HookMapping } from "../hooks";

type HookModule<K extends keyof HookMapping> = Record<
    K | "default",
    HookMapping[K]
>;

/**
 * Import and hook script and return the exported function.
 *
 * @internal
 * @param hook - Hook name.
 * @param scriptPath - Path to hook script (must exist).
 * @returns The hook function exposed from the user.
 */
export async function importHook<K extends keyof HookMapping>(
    hook: K,
    scriptPath: string,
): Promise<HookMapping[K]> {
    const mod = (await import(scriptPath)) as HookModule<K>;
    if (Object.hasOwn(mod, hook) && typeof mod[hook] === "function") {
        return mod[hook];
    }
    if ("default" in mod && typeof mod.default === "function") {
        return mod.default;
    }
    throw new HookNoExportedFnError({
        hookName: hook,
        scriptPath,
    });
}
