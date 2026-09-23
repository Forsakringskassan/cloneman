import { type CommandModule } from "yargs";
import yoctoSpinner from "yocto-spinner";

import { getTemplateParams } from "../get-template-params";

interface GetParamsArguments {
    packageName: string;
    json?: boolean;
}

async function getParamsHandler(argv: GetParamsArguments): Promise<void> {
    const { packageName: template, json } = argv;

    const spinner = yoctoSpinner({
        text: `Fetching template parameters for "${template}"...`,
    });

    if (!json) {
        spinner.start();
    }

    let result: Awaited<ReturnType<typeof getTemplateParams>>;
    try {
        result = await getTemplateParams({
            packageName: template,
        });
    } catch (err) {
        spinner.stop();
        throw err;
    }

    if (json) {
        console.log(JSON.stringify(result, null, 2));
    } else {
        spinner.success(
            `Fetched template parameters for "${template}" successfully`,
        );
        console.log(JSON.stringify(result, null, 2));
    }
}
/**
 * @internal
 */
export function getParamsCommand(): CommandModule<object, GetParamsArguments> {
    return {
        command: "get-params <packageName>",
        describe: "Get template parameters for a package",
        builder(yargs) {
            return yargs

                .positional("packageName", {
                    describe: "Package name",
                    type: "string",
                    demandOption: true,
                })
                .option("json", {
                    describe:
                        "Output result as pure JSON without any information",
                    type: "boolean",
                    default: false,
                });
        },
        async handler(argv) {
            await getParamsHandler(argv);
        },
    };
}
