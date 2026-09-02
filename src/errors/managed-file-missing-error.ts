import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class ManagedFileMissingError extends UserError {
    private readonly file: string;
    private readonly templateName: string;

    public constructor(options: { templateName: string; file: string }) {
        super(`Managed file(s) is missing from template`);
        this.name = "ManagedFileMissingError";
        this.templateName = options.templateName;
        this.file = options.file;
    }

    public override prettyMessage(): string {
        const { templateName, file } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman cannot build template "${templateName}": managed file not found.`,
            ),
            ``,
            `The file "${file}" is listed in "managedFiles" but does not match any file in the template.`,
            ``,
            `Make sure the file exists or remove it from "managedFiles".`,
        ].join("\n");
    }
}
