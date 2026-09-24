import { type CommandModule } from "yargs";
import yoctoSpinner from "yocto-spinner";
import { create } from "../create";
import { type Context } from "./context";
import { parseParams } from "./parse-params";

interface CreateArguments {
    name: string;
    template: string;
    param: string[];
    output: string;
}

async function createHandler(
    context: Context,
    argv: CreateArguments,
): Promise<void> {
    const { name, template, param, output } = argv;
    const { cwd } = context;
    const parameters = parseParams(param);

    const spinner = yoctoSpinner({
        text: `Creating application "${name}" with template "${template}"...`,
    }).start();

    let result: Awaited<ReturnType<typeof create>>;
    try {
        result = await create({
            name,
            templatePackage: template,
            cwd,
            parameters,
            spinner,
            output,
        });
    } catch (err) {
        spinner.stop();
        throw err;
    }

    spinner.success(`Application created successfully`);

    const { message } = result;
    console.group("");
    console.log(message);
    console.groupEnd();
}
/**
 * @internal
 */
export function createCommand(
    context: Context,
): CommandModule<object, CreateArguments> {
    return {
        command: "create <name> <template>",
        describe: "Create a new application from template",
        builder(yargs) {
            return yargs
                .positional("name", {
                    describe: "Name of the application (awesome-app)",
                    type: "string",
                    demandOption: true,
                })
                .positional("template", {
                    describe: "Template package name",
                    type: "string",
                    demandOption: true,
                })
                .option("param", {
                    describe: "Override a template parameter (key=value)",
                    type: "string",
                    array: true,
                    default: [],
                })
                .option("output", {
                    describe: "Output directory for the created application",
                    description:
                        "Use directory when creating the application. Default is to use application name as directory name.",
                    type: "string",
                    default: "",
                });
        },
        async handler(argv) {
            await createHandler(context, argv);
        },
    };
}
