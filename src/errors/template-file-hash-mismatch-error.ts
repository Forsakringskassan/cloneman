/* eslint-disable sonarjs/no-nested-template-literals -- easier to read than breaking it out further */

import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class TemplateFileHashMismatchError extends UserError {
    private readonly templateName: string;
    private readonly templateVersion: string;
    private readonly currentFileHash: string;
    private readonly expectedFileHash: string;

    public constructor(options: {
        templateName: string;
        templateVersion: string;
        currentFileHash: string;
        expectedFileHash: string;
    }) {
        super(`Invalid "cloneman" field in "package.json"`);
        this.name = "TemplateFileHashMismatchError";
        this.templateName = options.templateName;
        this.templateVersion = options.templateVersion;
        this.currentFileHash = options.currentFileHash;
        this.expectedFileHash = options.expectedFileHash;
    }

    public override prettyMessage(): string {
        const {
            templateName,
            templateVersion,
            currentFileHash,
            expectedFileHash,
        } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman application is not up-to-date: managed template files differ from the installed template version.`,
            ),
            ``,
            `Template name: "${templateName}"`,
            `Template version: "${templateVersion}"`,
            `Current managed-file hash: "${currentFileHash}"`,
            `Expected managed-file hash: "${expectedFileHash}"`,
            ``,
            `To update the application use the "update" command:`,
            ``,
            `  ${styleText("cyan", `npx cloneman update "${templateVersion}"`)}`,
            ``,
        ].join("\n");
    }
}
