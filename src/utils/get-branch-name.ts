import spawn from "nano-spawn";

/**
 * Get the current Git branch name.
 *
 * @internal
 */
export async function getBranchName(cwd: string): Promise<string> {
    try {
        const { stdout } = await spawn(
            "git",
            ["rev-parse", "--abbrev-ref", "HEAD"],
            { cwd },
        );
        return stdout.trim();
    } catch {
        return "";
    }
}
