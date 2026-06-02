import { styleText } from "node:util";
import { type Parameter } from "../types";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class ParameterInvalidKeyError extends UserError {
    private readonly parameter: Pick<Parameter, "key">;

    public constructor(parameter: Pick<Parameter, "key">) {
        super(`Invalid parameter key "${parameter.key}"`);
        this.name = "ParameterInvalidKeyError";
        this.parameter = parameter;
    }

    public override prettyMessage(): string {
        const { key } = this.parameter;
        return [
            styleText("red", `ERROR cloneman: invalid parameter key "${key}".`),
            ``,
            `This is an error in the template "build" hook.`,
            ``,
            `Ensure each \`template.addParameter()\` call uses a key that is one or more characters and consist only of:`,
            ``,
            `  - 0-9`,
            `  - a-z`,
            `  - hyphen`,
        ].join("\n");
    }
}
