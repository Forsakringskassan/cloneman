import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class ParameterRequiredError extends UserError {
    private readonly key: string;

    public constructor(key: string) {
        super(`Required parameter "${key}" was not provided`);
        this.name = "ParameterRequiredError";
        this.key = key;
    }

    public override prettyMessage(): string {
        const { key } = this;
        const param = `--param ${key}=<value>`;
        return [
            styleText(
                "red",
                `ERROR cloneman: required parameter "${key}" was not provided`,
            ),
            ``,
            `Pass a value using the ${styleText("cyan", param)} option.`,
        ].join("\n");
    }
}
