import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class CliTemplateNotFoundError extends UserError {
    private readonly templateName: string;
    private readonly summary: string;
    private readonly argv: string[];

    public constructor(options: {
        templateName: string;
        summary: string;
        argv: string[];
    }) {
        super(`template "${options.templateName}" not found`);
        this.name = "CliTemplateNotFoundError";
        this.templateName = options.templateName;
        this.summary = options.summary;
        this.argv = options.argv;
    }

    public override prettyMessage(): string {
        const { templateName, summary, argv } = this;
        const commandline = `$ cloneman ${argv.join(" ")}`;
        const marker = [
            " ".repeat(commandline.indexOf(templateName)),
            "^".repeat(templateName.length),
        ].join("");
        return [
            styleText(
                "red",
                `ERROR cloneman cannot find the template "${templateName}": ${summary}.`,
            ),
            ``,
            commandline,
            marker,
            ``,
            `Make sure the NPM package exists and you have permission to access it.`,
        ].join("\n");
    }
}
