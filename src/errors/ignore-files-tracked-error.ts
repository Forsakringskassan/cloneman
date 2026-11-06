import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class IgnoreFilesTrackedError extends UserError {
    private readonly files: string[];

    public constructor(files: string[]) {
        super(
            `Files matching "cloneman.ignoreFiles" must not be checked into Git: ${files.join(", ")}`,
        );
        this.name = "IgnoreFilesTrackedError";
        this.files = files;
    }

    public override prettyMessage(): string {
        const { files } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman cannot update: ignored files must not be tracked by Git.`,
            ),
            ``,
            `These files match "cloneman.ignoreFiles" and are tracked by Git:`,
            ``,
            ...files.map((file) => `  - ${file}`),
            ``,
            `Remove these files from Git tracking before using "cloneman.ignoreFiles".`,
        ].join("\n");
    }
}
