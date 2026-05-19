import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class HookNoExportedFnError extends UserError {
    private readonly hookName: string;
    private readonly scriptPath: string;

    public constructor({
        hookName,
        scriptPath,
    }: {
        hookName: string;
        scriptPath: string;
    }) {
        super(`Hook script is not exporting callback`);
        this.name = "HookNoExportedFnError";
        this.hookName = hookName;
        this.scriptPath = scriptPath;
    }

    public override prettyMessage(): string {
        const { hookName, scriptPath } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman cannot run hook "${hookName}": the script is not exporting a callback function.`,
            ),
            ``,
            `The "${hookName}" hook at "${scriptPath}" must either:`,
            ``,
            `  - export a named function "${hookName}"`,
            `  - default export a function`,
        ].join("\n");
    }
}
