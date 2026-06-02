import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class ParameterValidationError extends UserError {
    private readonly parameter: string;
    private readonly value: string;
    private readonly pattern: string;

    public constructor({
        parameter,
        value,
        pattern,
    }: {
        parameter: string;
        value: string;
        pattern: string;
    }) {
        super(
            `Value "${value}" for parameter "${parameter}" does not match required pattern ${pattern}`,
        );
        this.name = "ParameterValidationError";
        this.parameter = parameter;
        this.value = value;
        this.pattern = pattern;
    }

    public override prettyMessage(): string {
        const { parameter, value, pattern } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman: value for parameter "${parameter}" does not match required pattern`,
            ),
            ``,
            `  Value:   "${styleText("yellow", value)}"`,
            `  Pattern: "${styleText("yellow", pattern)}"`,
        ].join("\n");
    }
}
