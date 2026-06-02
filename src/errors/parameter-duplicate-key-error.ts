import { styleText } from "node:util";
import { type Parameter } from "../types";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class ParameterDuplicateKeyError extends UserError {
    private readonly parameter: Pick<Parameter, "key">;

    public constructor(parameter: Pick<Parameter, "key">) {
        super(`Duplicate parameter key "${parameter.key}"`);
        this.name = "ParameterDuplicateKeyError";
        this.parameter = parameter;
    }

    public override prettyMessage(): string {
        const { key } = this.parameter;
        return [
            styleText(
                "red",
                `ERROR cloneman: duplicate parameter key "${key}".`,
            ),
            ``,
            `This is an error in the template "build" hook.`,
            ``,
            `Ensure each \`template.addParameter()\` call uses a unique key.`,
        ].join("\n");
    }
}
