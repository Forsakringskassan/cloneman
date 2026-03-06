import { type CommandModule } from "yargs";
import { type Context } from "./context";

interface UpdateArguments {
    target: string | undefined;
}

function updateHandler(
    _context: Context,
    argv: UpdateArguments,
): Promise<void> {
    const { target } = argv;
    console.log(`Updating the application to version ${target ?? "latest"}...`);
    return Promise.resolve();
}

/**
 * @internal
 */
export function updateCommand(
    context: Context,
): CommandModule<object, UpdateArguments> {
    return {
        command: "update [target]",
        describe: "Update the application",
        builder(yargs) {
            return yargs.positional("target", {
                describe: "Version to update to",
                type: "string",
                demandOption: false,
            });
        },
        async handler(argv) {
            await updateHandler(context, argv);
        },
    };
}
