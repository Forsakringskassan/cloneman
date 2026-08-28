import { input } from "@inquirer/prompts";
import { type CommandModule } from "yargs";
import yoctoSpinner from "yocto-spinner";
import { create } from "../create";
import { type Context } from "./context";
import { parseParams } from "./parse-params";

interface CreateArguments {
    name: string;
    template: string;
    param: string[];
}

async function createHandler(
    context: Context,
    argv: CreateArguments,
): Promise<void> {
    const { template, param } = argv;
    let { name } = argv;
    let currentDirectory = false;

    if (name === ".") {
        currentDirectory = true;
        name = await input({ message: "Application name" });
    }

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
            currentDirectory,
            spinner,
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
                    describe:
                        "Name of the application (awesome-app) | Use . for current directory and you will be prompted for the name in package.json",
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
                });
        },
        async handler(argv) {
            await createHandler(context, argv);
        },
    };
}
