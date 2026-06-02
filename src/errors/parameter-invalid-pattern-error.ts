import { styleText } from "node:util";
import { type Parameter } from "../types";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class ParameterInvalidPatternError extends UserError {
    private readonly parameter: Pick<Parameter, "key" | "pattern">;

    public constructor(
        parameter: Pick<Parameter, "key" | "pattern">,
        errorOptions?: ErrorOptions,
    ) {
        const { key, pattern } = parameter;
        super(
            `Pattern "${String(pattern)}" for parameter "${key}" is not a valid regular expression`,
            errorOptions,
        );
        this.name = "ParameterInvalidPatternError";
        this.parameter = parameter;
    }

    public override prettyMessage(): string {
        const { key, pattern } = this.parameter;
        const patternLiteral = JSON.stringify(pattern ?? "");
        const cause =
            this.cause instanceof Error
                ? ` ${styleText("magenta", this.cause.message)}`
                : "";
        const offsetQuotes = 2;
        return [
            styleText(
                "red",
                `ERROR cloneman: pattern ${patternLiteral} for parameter "${key}" is not a valid regular expression`,
            ),
            ``,
            `This is an error in the template "build" hook.`,
            ``,
            `Ensure the \`template.addParameter()\` call uses a valid regular expression:`,
            ``,
            `  template.addParameter("${key}", {`,
            `    pattern: ${patternLiteral},`,
            `              ${styleText("red", "^".repeat(patternLiteral.length - offsetQuotes))}${cause}`,
            `  });`,
            ``,
        ].join("\n");
    }
}
