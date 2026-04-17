/* eslint-disable sonarjs/no-nested-template-literals -- easier to read than breaking it out further */

import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class TemplateDependencyMissingError extends UserError {
    private readonly templateVersion: string;
    private readonly templateName: string;

    public constructor(options: {
        templateName: string;
        templateVersion: string;
    }) {
        super(`Invalid "cloneman" field in "package.json"`);
        this.name = "TemplateDependencyMissingError";
        this.templateName = options.templateName;
        this.templateVersion = options.templateVersion;
    }

    public override prettyMessage(): string {
        const { templateName, templateVersion } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman template dependency is missing: "package.json" is missing the "${templateName}@${templateVersion}" dependency.`,
            ),
            ``,
            `The "cloneman" field references the template "${templateName}" but the NPM dependency is missing.`,
            ``,
            `Install the dependency with:`,
            ``,
            `  ${styleText("cyan", `npm install --save-dev --save-exact ${templateName}@${templateVersion}`)}`,
            ``,
        ].join("\n");
    }
}
