import { type CommandModule } from "yargs";
import { update } from "../update";
import { type Context } from "./context";

interface UpdateArguments {
    target: string | undefined;
}

async function updateHandler(
    context: Context,
    argv: UpdateArguments,
): Promise<void> {
    const { target } = argv;
    const { cwd } = context;

    const version = target ?? "latest";
    console.log(`Updating the application to version ${version}...`);
    await update(cwd, version, {});
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
