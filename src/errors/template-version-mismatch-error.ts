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
    private readonly isRenovateBranch: boolean;

    public constructor(options: {
        templateName: string;
        templateVersion: string;
        dependencyVersion: string;
        isRenovateBranch: boolean;
    }) {
        super(`Invalid "cloneman" field in "package.json"`);
        this.name = "TemplateVersionMismatchError";
        this.templateName = options.templateName;
        this.templateVersion = options.templateVersion;
        this.dependencyVersion = options.dependencyVersion;
        this.isRenovateBranch = options.isRenovateBranch;
    }

    public override prettyMessage(): string {
        const {
            templateName,
            templateVersion,
            dependencyVersion,
            isRenovateBranch,
        } = this;

        const renovateInstructions = [
            `How to fix it:`,
            ` 1. Check out the branch where the update failed (the Renovate pull request branch).`,
            ` 2. Run ${styleText("cyan", `npx cloneman update ${dependencyVersion}`)} to update both the managed files and dependencies.`,
            ` 3. Commit and push the changes to this branch.`,
            `  $ git add -A && git commit --reset-author --amend --no-edit && git push --force-with-lease`,
        ];

        const defaultInstructions = [
            `How to fix it:`,
            ` 1. Check out the branch where the update failed.`,
            ` 2. Run ${styleText("cyan", `npx cloneman update ${dependencyVersion}`)} to update both the managed files and dependencies.`,
            ``,
            ` To lock the dependency to the template version currently used by your application:`,
            ``,
            ` ${styleText("cyan", `npm install --save-dev --save-exact ${templateName}@${templateVersion}`)}`,
            ``,
            ` 3. Commit and push the changes to the same branch.`,
        ];

        let instructions = defaultInstructions;
        if (isRenovateBranch) {
            instructions = renovateInstructions;
        }
        return [
            styleText(
                "red",
                `ERROR cloneman template version mismatch: the application was last updated with a different template version than the one specified in package.json.`,
            ),
            ``,
            ...instructions,
            `---`,
            `Debug:`,
            ` Template name: "${templateName}"`,
            ` Application last updated with template version: "${templateVersion}"`,
            ` Template dependency version in package.json: "${dependencyVersion}"`,
        ].join("\n");
    }
}
