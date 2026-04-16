/* eslint-disable sonarjs/no-nested-template-literals -- easier to read than breaking it out further */

import { inspect, styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class InvalidClonemanFieldError extends UserError {
    private readonly value: unknown;

    public constructor(value: unknown) {
        super(`Invalid "cloneman" field in "package.json"`);
        this.name = "InvalidClonemanFieldError";
        this.value = value;
    }

    public override prettyMessage(): string {
        const { value } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman cannot update application: "package.json" has invalid "cloneman" field.`,
            ),
            ``,
            `The "cloneman" field is expected to be an object with the template and version fields but was actually: ${inspect(value)}.`,
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
