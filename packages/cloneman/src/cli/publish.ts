import path from "node:path";
import { type CommandModule } from "yargs";
import { TEMPLATE_BUILD_PATH } from "../constants";
import { prepare } from "../prepare";
import { publish } from "../publish";
import { type Context } from "./context";

async function publishHandler(context: Context): Promise<void> {
    console.log("Publishing template");
    const { cwd } = context;
    const targetDir = path.join(cwd, TEMPLATE_BUILD_PATH);
    await prepare(cwd, targetDir);
    await publish({ cwd: targetDir });
}

/**
 * @internal
 */
export function publishCommand(context: Context): CommandModule {
    return {
        command: "publish",
        describe:
            "Publish template. You need to be in the template folder to run this command.",
        builder(yargs) {
            return yargs;
        },
        async handler() {
            await publishHandler(context);
        },
    };
}
