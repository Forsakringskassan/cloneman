import path from "node:path";
import { type CommandModule } from "yargs";
import { prepare } from "../prepare";
import { type Context } from "./context";

interface BuildArguments {
    output: string;
}

async function buildHandler(
    context: Context,
    argv: BuildArguments,
): Promise<void> {
    const { cwd } = context;
    const { output } = argv;
    console.log("Pack template");

    const targetDir = path.join(cwd, output);
    const { output: prepareOutput } = await prepare(cwd, targetDir);
    console.log(prepareOutput);
}

/**
 * @internal
 */
export function buildCommand(
    context: Context,
): CommandModule<object, BuildArguments> {
    return {
        command: "build",
        describe: `Build template to temporary directory`,
        builder(yargs) {
            return yargs
                .option("output", {
                    alias: "o",
                    describe: "Directory to write output to",
                    type: "string",
                    demandOption: true,
                })
                .demandOption(["output"]);
        },
        async handler(argv) {
            await buildHandler(context, argv);
        },
    };
}
