import { type CommandModule } from "yargs";
import { create } from "../create";
import { type Context } from "./context";

interface CreateArguments {
    name: string;
    template: string;
}

function createHandler(context: Context, argv: CreateArguments): Promise<void> {
    const { name, template } = argv;
    const { cwd } = context;
    console.log(`Creating app ${name} from template ${template}`);
    return create({ name, templatePackage: template, cwd });
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
