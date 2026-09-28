import { type CommandModule } from "yargs";
import yoctoSpinner from "yocto-spinner";
import { update } from "../update";
import { type Context } from "./context";
import { parseParams } from "./parse-params";

interface UpdateArguments {
    target: string | undefined;
    param: string[];
    "if-same-filehash": boolean;
    "only-dependencies": boolean;
}

async function updateHandler(
    context: Context,
    argv: UpdateArguments,
): Promise<void> {
    const {
        target,
        param,
        "if-same-filehash": ifSameFilehash,
        "only-dependencies": onlyDependencies,
    } = argv;
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
            ifSameFilehash: ifSameFilehash || onlyDependencies,
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
                .option("if-same-filehash", {
                    describe:
                        "Only update if thefile hash match between versions.\n" +
                        "A matching filehash means the managed files are unchanged between versions and only dependencies are updated.\n" +
                        "This option is deprecated and replaced by --only-dependencies.",
                    type: "boolean",
                    deprecated: true,
                    default: false,
                })
                .option("only-dependencies", {
                    describe:
                        "Only update the dependencies & devDependencies for the application, leaving other managed files untouched.\n" +
                        "This option only works if the content of managed files has not changed between versions. If the list has changed, the command will fail and you must perform a full update.",
                    type: "boolean",
                    default: false,
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
