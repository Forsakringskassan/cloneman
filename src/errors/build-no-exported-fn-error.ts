import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class BuildNoExportedFnError extends UserError {
    private readonly scriptPath: string;

    public constructor({ scriptPath }: { scriptPath: string }) {
        super(`Build script is not exporting callback`);
        this.name = "BuildNoExportedFnError";
        this.scriptPath = scriptPath;
    }

    public override prettyMessage(): string {
        const { scriptPath } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman cannot compile template: the build script is not exporting a callback function.`,
            ),
            ``,
            `The build script at "${scriptPath}" must either:`,
            ``,
            `  - export a named function "build"`,
            `  - default export a function`,
        ].join("\n");
    }
}
