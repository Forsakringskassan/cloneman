import type { ReplaceInFileOptions } from "../hooks/install-context";

/**
 * @internal
 */
export function unpackReplaceInFileArgs(replaceInFileArgs: unknown[]): {
    match: RegExp | undefined;
    pattern: string | RegExp;
    replacement: string | ((match: string, ...args: string[]) => string);
    graceful: boolean | undefined;
} {
    const args = [...replaceInFileArgs];
    const last = args.at(-1);

    const options =
        typeof last === "object" && last !== null && !(last instanceof RegExp)
            ? (args.pop() as ReplaceInFileOptions)
            : undefined;

    const match = args.length === 3 ? (args.shift() as RegExp) : undefined;

    const [pattern, replacement] = args as [
        string | RegExp,
        string | ((match: string, ...args: string[]) => string),
    ];

    return { match, pattern, replacement, graceful: options?.graceful };
}
