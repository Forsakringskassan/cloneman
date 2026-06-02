import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class ParameterNotDeclaredError extends UserError {
    private readonly hook: string;
    private readonly parameter: string;

    public constructor({
        hook,
        parameter,
    }: {
        hook: string;
        parameter: string;
    }) {
        super(
            `Parameter "${parameter}" was referenced in hook "${hook}" but was not declared`,
        );
        this.name = "ParameterNotDeclaredError";
        this.parameter = parameter;
        this.hook = hook;
    }

    public override prettyMessage(): string {
        const { hook, parameter } = this;
        const decl = `template.addParameter("${parameter}", { ... })`;
        return [
            styleText(
                "red",
                `ERROR cloneman: parameter "${parameter}" was referenced in hook "${hook}" but was not declared.`,
            ),
            ``,
            "This is an error in the template. Please report it to the template maintainer.",
            `The parameter must be declared in the build hook using ${styleText("cyan", decl)}`,
        ].join("\n");
    }
}
