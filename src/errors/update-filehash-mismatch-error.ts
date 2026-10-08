import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class UpdateFilehashMismatchError extends UserError {
    private readonly oldHash: string;
    private readonly newHash: string;

    public constructor({
        oldHash,
        newHash,
    }: {
        oldHash: string;
        newHash: string;
    }) {
        super(
            `Value "${newHash}" does not match the expected old hash "${oldHash}"`,
        );
        this.name = "UpdateFilehashMismatchError";
        this.oldHash = oldHash;
        this.newHash = newHash;
    }

    public override prettyMessage(): string {
        const { oldHash, newHash } = this;
        return [
            styleText(
                "red",
                "ERROR cloneman: Update task failed, Cannot update because the template's managed files have changed.",
            ),
            ``,
            "Why this happened:",
            "The template has changed since this branch was last fully updated.",
            ``,
            "How to fix it:",
            "1. Check out the branch where the update failed (for example, the Renovate pull request branch).",
            "2. Run `npx cloneman update` to update both the managed files and dependencies.",
            "3. Commit and push the changes to the same branch.",
            ``,
            "New hash does not match the expected old hash:",
            `  Expected: "${styleText("yellow", oldHash)}"`,
            `  Found:    "${styleText("yellow", newHash)}"`,
        ].join("\n");
    }
}
