/**
 * Parses an array of `key=value` strings into a map.
 *
 * @internal
 */
export function parseParams(params: string[]): Map<string, string> {
    const entries = params.map((param): [string, string] => {
        const index = param.indexOf("=");
        if (index === -1) {
            throw new Error(
                `Invalid --param "${param}": invalid format (expected "key=value")`,
            );
        }
        if (index === 0) {
            throw new Error(
                `Invalid --param "${param}": key missing (expected "key=value")`,
            );
        }
        return [param.slice(0, index), param.slice(index + 1)];
    });
    return new Map(entries);
}
