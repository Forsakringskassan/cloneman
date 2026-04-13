import { type CommandModule } from "yargs";
import yoctoSpinner from "yocto-spinner";
import { create } from "../create";
import { type Context } from "./context";

interface CreateArguments {
    name: string;
    template: string;
}

async function createHandler(
    context: Context,
    argv: CreateArguments,
): Promise<void> {
    const { name, template } = argv;
    const { cwd } = context;

    const spinner = yoctoSpinner({
        text: `Creating application "${name}" with template "${template}"...`,
    }).start();

    try {
        await create({ name, templatePackage: template, cwd, spinner });
    } catch (err) {
        spinner.stop();
        throw err;
    }

    spinner.success(`Application created successfully.`);
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
                });
        },
        async handler(argv) {
            await createHandler(context, argv);
        },
    };
}
