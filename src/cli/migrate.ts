import { type CommandModule } from "yargs";
import yoctoSpinner from "yocto-spinner";
import { CliTemplateNotFoundError } from "../errors";
import { migrate } from "../migrate";
import { NpmInfoError } from "../utils";
import { type Context } from "./context";

interface MigrateArguments {
    template: string;
}

async function createHandler(
    context: Context,
    argv: MigrateArguments,
): Promise<void> {
    const { template } = argv;
    const { cwd } = context;

    const spinner = yoctoSpinner({
        text: `Migrating application to template "${template}"...`,
    }).start();

    try {
        await migrate({ templatePackage: template, cwd, spinner });
    } catch (err) {
        spinner.stop();
        if (err instanceof NpmInfoError) {
            switch (err.code) {
                case "E404":
                    throw new CliTemplateNotFoundError({
                        templateName: template,
                        summary: err.message,
                        argv: process.argv.slice(2),
                    });
            }
        }
        throw err;
    }

    spinner.success(`Application migrated successfully`);

    console.log(`
Now run:

  npx cloneman update latest

  to update the application to the latest version of the template.
`);
}
/**
 * @internal
 */
export function migrateCommand(
    context: Context,
): CommandModule<object, MigrateArguments> {
    return {
        command: "migrate <template>",
        describe: "Migrate an existing application to a template",
        builder(yargs) {
            return yargs.positional("template", {
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
