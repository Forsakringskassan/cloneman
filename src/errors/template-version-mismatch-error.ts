/* eslint-disable sonarjs/no-nested-template-literals -- easier to read than breaking it out further */

import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class TemplateVersionMismatchError extends UserError {
    private readonly templateName: string;
    private readonly templateVersion: string;
    private readonly dependencyVersion: string;

    public constructor(options: {
        templateName: string;
        templateVersion: string;
        dependencyVersion: string;
    }) {
        super(`Invalid "cloneman" field in "package.json"`);
        this.name = "TemplateVersionMismatchError";
        this.templateName = options.templateName;
        this.templateVersion = options.templateVersion;
        this.dependencyVersion = options.dependencyVersion;
    }

    public override prettyMessage(): string {
        const { templateName, templateVersion, dependencyVersion } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman application is not up-to-date: the application is generated from a different version than NPM dependency.`,
            ),
            ``,
            `Template name: "${templateName}"`,
            `Template version: "${templateVersion}"`,
            `NPM Dependency version: "${dependencyVersion}"`,
            ``,
            `To update the application use the "update" command:`,
            ``,
            `  ${styleText("cyan", `npx cloneman update "${dependencyVersion}"`)}`,
            ``,
            `Or, pin the NPM dependency to the matching version:`,
            ``,
            `  ${styleText("cyan", `npm install --save-dev --save-exact ${templateName}@${dependencyVersion}`)}`,
            ``,
        ].join("\n");
    }
}
