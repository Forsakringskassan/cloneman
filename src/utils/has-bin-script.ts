import fs from "node:fs";
import path from "node:path";

/**
 * Checks whether a binary script exists in the `node_modules/.bin` folder of
 * the given directory.
 *
 * @internal
 * @param bin - Name of the binary.
 * @param cwd - Directory containing the `node_modules` folder to look in.
 * @returns `true` if a matching script exists, `false` otherwise.
 */
export function hasBinScript(bin: string, cwd: string): boolean {
    const binDir = path.join(cwd, "node_modules", ".bin");
    /* npm creates ".cmd" and ".ps1" shims alongside the shell script on windows */
    const candidates = [bin, `${bin}.cmd`, `${bin}.ps1`];
    return candidates.some((candidate) =>
        fs.existsSync(path.join(binDir, candidate)),
    );
}
