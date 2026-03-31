import spawn from "nano-spawn";

/**
 * Publishes the prepared template to the npm registry using `npm publish`.
 *
 * @public
 * @since %version%
 *
 * @param options - The options for publishing the template.
 *   - `cwd`: The directory containing the prepared template to publish.
 *   - `env`: Optional environment variables to pass to the `npm publish` command.
 *   - `npmRcPath`: Optional path to a custom .npmrc file to use during publishing.
 */
export async function publish(options: {
    cwd: string;
    env?: Record<string, string>;
    npmRcPath?: string;
}): Promise<void> {
    const { cwd, env = {}, npmRcPath } = options;
    try {
        const args = ["publish"];
        if (npmRcPath) {
            args.push("--userconfig", npmRcPath);
        }
        await spawn("npm", args, { cwd, env });
    } catch (err) {
        console.error("Failed to publish template:", err);
        throw err;
    }
}
