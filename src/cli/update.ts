import { type CommandModule } from "yargs";
import yoctoSpinner from "yocto-spinner";
import { update } from "../update";
import { type Context } from "./context";
import { parseParams } from "./parse-params";

interface UpdateArguments {
    target: string | undefined;
    param: string[];
}

async function updateHandler(
    context: Context,
    argv: UpdateArguments,
): Promise<void> {
    const { target, param } = argv;
    const { cwd } = context;

    const version = target ?? "latest";
    const parameters = parseParams(param);

    const spinner = yoctoSpinner({
        text: `Updating template package to version ${version}...`,
    }).start();

    let result: Awaited<ReturnType<typeof update>>;
    try {
        result = await update({
            cwd,
            version,
            env: {},
            parameters,
            spinner,
        });
    } catch (err) {
        spinner.stop();
        throw err;
    }

    spinner.success(`Template package updated to version ${version}`);

    const { message } = result;
    console.group("");
    console.log(message);
    console.groupEnd();
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
            return yargs
                .positional("target", {
                    describe: "Version to update to",
                    type: "string",
                    demandOption: false,
                })
                .option("param", {
                    describe: "Override a template parameter (key=value)",
                    type: "string",
                    array: true,
                    default: [],
                });
        },
        async handler(argv) {
            await updateHandler(context, argv);
        },
    };
}
