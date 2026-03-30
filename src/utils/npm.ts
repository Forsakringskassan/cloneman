import spawn from "nano-spawn";

/**
 * Fetches information about an npm package.
 * @internal
 * @param spec - The package specifier (e.g., package name).
 * @param options - The options for fetching the package information.
 *  - `field`: Optional specific field to retrieve from the package information.
 *  - `env`: Optional environment variables to pass to the `npm info` command.
 * @returns Json-parsed output from `npm info` command.
 */
export async function info<T = unknown>(
    spec: string,
    options: { field?: string; env?: Record<string, string> },
): Promise<T> {
    const { env, field } = options;
    const args = ["info", spec, "--json", "--loglevel=error"];
    if (field) {
        args.push(field);
    }
    const { stdout } = await spawn("npm", args, { env: env ?? {} });
    return JSON.parse(stdout) as Promise<T>;
}
