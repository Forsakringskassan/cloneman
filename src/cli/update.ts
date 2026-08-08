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

    const version = target ?? "minor";
    const parameters = parseParams(param);

    let versionText: string;
    if (version === "latest") {
        versionText = "latest version";
    } else if (version === "minor" || version === "patch") {
        versionText = `latest ${version} version`;
    } else {
        versionText = `version ${version}`;
    }

    const spinner = yoctoSpinner({
        text: `Updating template package to ${versionText}...`,
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

    const { message, resolvedVersion, notice } = result;
    spinner.success(`Template package updated to version ${resolvedVersion}`);

    if (notice) {
        console.warn(notice);
    }

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
                    describe:
                        "Version or update strategy (latest|minor|patch|x.y.z)",
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
