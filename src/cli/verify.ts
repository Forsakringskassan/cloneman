import { type CommandModule } from "yargs";
import { verify } from "../verify";
import { type Context } from "./context";

interface VerifyArguments {
    "managed-files-only": boolean;
}

async function verifyHandler(
    context: Context,
    argv: VerifyArguments,
): Promise<void> {
    const { cwd: applicationPath } = context;
    const managedFilesOnly = argv["managed-files-only"];
    await verify({ applicationPath, managedFilesOnly, env: {} });
}

/**
 * @internal
 */
export function verifyCommand(
    context: Context,
): CommandModule<object, VerifyArguments> {
    return {
        command: "verify",
        describe: "Verify the application is up-to-date",
        builder(yargs) {
            return yargs.option("managed-files-only", {
                describe: "Only verify managed files are up-to-date",
                type: "boolean",
                default: false,
            });
        },
        async handler(argv) {
            await verifyHandler(context, argv);
        },
    };
}
