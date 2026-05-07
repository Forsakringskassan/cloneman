import { existsSync } from "node:fs";
import spawn from "nano-spawn";

/**
 * Runs template install hook if script exists.
 *
 * @internal
 */
export async function runTemplateInstall(options: {
    installScriptPath: string;
    cwd: string;
    env?: Record<string, string>;
}): Promise<void> {
    const { installScriptPath, cwd, env = {} } = options;

    if (!existsSync(installScriptPath)) {
        return;
    }

    await spawn("node", [installScriptPath], {
        cwd,
        env,
    });
}
