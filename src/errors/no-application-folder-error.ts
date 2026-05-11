import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class NoApplicationFolderError extends UserError {
    public constructor() {
        super(`No application folder found`);
        this.name = "NoApplicationFolderError";
    }

    public override prettyMessage(): string {
        return [
            styleText("red", `ERROR cannot read package.json.`),
            ``,
            `Make sure you are running the command in the root of your application.`,
        ].join("\n");
    }
}
