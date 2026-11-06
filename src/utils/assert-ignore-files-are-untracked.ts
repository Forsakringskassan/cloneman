import spawn, { SubprocessError } from "nano-spawn";
import { IgnoreFilesTrackedError } from "../errors";
import { matchesPatterns } from "./matches-patterns";

/**
 * @internal
 */
export async function assertIgnoreFilesAreUntracked(
    ignoreFiles: string[] | undefined,
    { cwd }: { cwd: string },
): Promise<void> {
    if (!ignoreFiles?.length) {
        return;
    }

    let output: string;
    try {
        ({ stdout: output } = await spawn("git", ["ls-files", "-z"], { cwd }));
    } catch (error) {
        if (
            error instanceof SubprocessError &&
            error.exitCode === 128 &&
            error.stderr.includes("not a git repository")
        ) {
            return;
        }
        throw error;
    }

    const trackedFiles = output
        .split("\0")
        .filter((filename) => matchesPatterns(filename, ignoreFiles));
    if (trackedFiles.length > 0) {
        throw new IgnoreFilesTrackedError(trackedFiles);
    }
}
