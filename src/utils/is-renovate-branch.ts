import spawn from "nano-spawn";

export async function isRenovateBranch(cwd: string): Promise<boolean> {
    try {
        const { stdout } = await spawn(
            "git",
            ["rev-parse", "--abbrev-ref", "HEAD"],
            { cwd },
        );
        return stdout.trim().includes("renovate/");
    } catch {
        return false;
    }
}
