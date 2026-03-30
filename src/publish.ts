import spawn from "nano-spawn";

/**
 * @internal
 */
export async function publish(options: {
    cwd: string;
    env?: Record<string, string>;
}): Promise<void> {
    const { cwd, env = process.env } = options;
    try {
        await spawn("npm", ["publish"], { cwd, env });
    } catch (err) {
        console.error("Failed to publish template:", err);
        throw err;
    }
}
