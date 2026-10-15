/**
 * @internal
 */
export function isRenovateBranch(branchName: string | undefined): boolean {
    return branchName?.includes("renovate/") ?? false;
}
