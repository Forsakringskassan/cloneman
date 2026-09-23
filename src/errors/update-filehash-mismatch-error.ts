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
                `ERROR cloneman: Update task failed, new hash does not match the expected old hash`,
            ),
            ``,
            `  Old Hash: "${styleText("yellow", oldHash)}"`,
            `  New Hash: "${styleText("yellow", newHash)}"`,

            "The template's managed files have changed between versions. A full update is required",
            "Run npx cloneman update",
        ].join("\n");
    }
}
