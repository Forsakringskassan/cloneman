import { type CommandModule } from "yargs";
import { verify } from "../verify";
import { type Context } from "./context";

async function verifyHandler(context: Context): Promise<void> {
    const { cwd: applicationPath } = context;
    await verify({ applicationPath });
}

/**
 * @internal
 */
export function verifyCommand(context: Context): CommandModule<object> {
    return {
        command: "verify",
        describe: "Verify the application is up-to-date",
        async handler() {
            await verifyHandler(context);
        },
    };
}
