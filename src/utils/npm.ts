import spawn from "nano-spawn";

/**
 * Fetches information about an npm package.
 * @internal
 * @param spec - The package specifier (e.g., package name).
 * @param options - The options for fetching the package information.
 *   - `env`: Optional environment variables to pass to the `npm info` command.
 * @returns Json-parsed output from `npm info` command.
 */
export async function info<T = unknown>(
    spec: string,
    options: { env: Record<string, string> },
): Promise<T> {
    const { env } = options;
    const { stdout } = await spawn(
        "npm",
        ["info", spec, "--json", "--loglevel=error"],
        { env },
    );
    return JSON.parse(stdout) as Promise<T>;
}
