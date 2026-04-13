/* eslint-disable sonarjs/no-nested-template-literals -- easier to read than breaking it out further */

import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class MissingClonemanFieldError extends UserError {
    public constructor() {
        super(`Missing "cloneman" field in "package.json"`);
        this.name = "MissingClonemanFieldError";
    }

    public override prettyMessage(): string {
        return [
            styleText(
                "red",
                `ERROR cloneman cannot update application: "package.json" is missing the required "cloneman" field.`,
            ),
            ``,
            `Make sure this application uses cloneman to manage the template.`,
            ``,
            `To create a new application from a template use the "create" command:`,
            ``,
            `  ${styleText("cyan", `npx cloneman create "..."`)}`,
            ``,
            `To migrate an existing application to use a template use the "migrate" command:`,
            ``,
            `  ${styleText("cyan", `npx cloneman migrate "..."`)}`,
            ``,
        ].join("\n");
    }
}
