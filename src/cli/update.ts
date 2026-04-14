import { type CommandModule } from "yargs";
import yoctoSpinner from "yocto-spinner";
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

    const spinner = yoctoSpinner({
        text: `Updating template package to version ${version}...`,
    }).start();

    try {
        await update(cwd, version, {}, spinner);
    } catch (err) {
        spinner.stop();
        throw err;
    }

    spinner.success(`Template package updated to version ${version}`);

    console.log(`
Now run:

  npm install
    `);
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
