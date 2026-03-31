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
 */
export async function publish(options: {
    cwd: string;
    env?: Record<string, string>;
}): Promise<void> {
    const { cwd, env = {} } = options;
    try {
        await spawn("npm", ["publish"], { cwd, env });
    } catch (err) {
        console.error("Failed to publish template:", err);
        throw err;
    }
}
