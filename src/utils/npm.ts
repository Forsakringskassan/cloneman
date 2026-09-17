import spawn, { type SubprocessError } from "nano-spawn";

function isSubprocessError(err: unknown): err is SubprocessError {
    return err instanceof Error && "stderr" in err;
}

interface NpmInfoErrorData {
    code: string;
    summary: string;
}

function parseNpmInfoError(text: string): NpmInfoErrorData | undefined {
    try {
        const parsed = JSON.parse(text) as { error?: NpmInfoErrorData };
        return parsed.error;
    } catch {
        return undefined;
    }
}

/**
 * @internal
 */
export class NpmInfoError extends Error {
    public readonly code: string;

    public constructor(code: string, message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "NpmInfoError";
        this.code = code;
    }

    public static fromSubprocessError(err: SubprocessError): Error {
        /* this feels very fragile but until we call `info` programatically we
         * need to parse the output from the failed command and cross our
         * fingers the format doesn't change or vary between platforms,
         * versions, by time of day or planetary alignment */
        const error = parseNpmInfoError(err.stdout);
        if (!error) {
            return err;
        }
        return new NpmInfoError(error.code, error.summary, {
            cause: err,
        });
    }
}

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

    let stdout;
    try {
        const result = await spawn("npm", args, { env: env ?? {} });
        stdout = result.stdout;
    } catch (err: unknown) {
        if (isSubprocessError(err)) {
            throw NpmInfoError.fromSubprocessError(err);
        }
        throw err;
    }

    return JSON.parse(stdout) as Promise<T>;
}
