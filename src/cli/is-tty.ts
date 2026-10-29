/**
 * @internal
 */
export function isTTY(): boolean {
    return process.stderr.isTTY;
}
