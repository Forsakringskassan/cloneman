import path from "node:path";
import { type CommandModule } from "yargs";
import { TEMPLATE_BUILD_PATH } from "../constants";
import { pack } from "../pack";
import { prepare } from "../prepare";
import { type Context } from "./context";

async function packHandler(context: Context): Promise<void> {
    const { cwd } = context;
    console.log("Pack template");

    const targetDir = path.join(cwd, TEMPLATE_BUILD_PATH);
    const { output: prepareOutput } = await prepare(cwd, targetDir);
    console.log(prepareOutput);
    await pack({ cwd, targetDir });
}

/**
 * @internal
 */
export function packCommand(context: Context): CommandModule {
    return {
        command: "pack",
        describe: `Pack template (similar to "npm pack"). You need to be in the template folder to run this command.`,
        builder(yargs) {
            return yargs;
        },
        async handler() {
            await packHandler(context);
        },
    };
}
