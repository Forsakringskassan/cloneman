import { matchesGlob } from "node:path";

/**
 * Tests whether a key matches a list of patterns, supporting negation.
 *
 * A key matches if it satisfies at least one positive pattern and is not
 * excluded by any negation pattern (prefixed with `!`).
 *
 * @internal
 */
export function matchesPatterns(key: string, patterns: string[]): boolean {
    const positive = patterns.filter((p) => !p.startsWith("!"));
    const negative = patterns
        .filter((p) => p.startsWith("!"))
        .map((p) => p.slice(1));
    return (
        positive.some((pattern) => matchesGlob(key, pattern)) &&
        negative.every((pattern) => !matchesGlob(key, pattern))
    );
}
