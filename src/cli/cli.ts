import yargs from "yargs";
import { name } from "../../package.json";
import { UserError } from "../errors";
import { buildCommand } from "./build";
import { type Context } from "./context";
import { createCommand } from "./create";
import { packCommand } from "./pack";
import { publishCommand } from "./publish";
import { updateCommand } from "./update";
import { verifyCommand } from "./verify";

/**
 * @internal
 */
export function createParser(context: Context): ReturnType<typeof yargs> {
    return yargs()
        .scriptName(name)
        .command(buildCommand(context))
        .command(createCommand(context))
        .command(packCommand(context))
        .command(publishCommand(context))
        .command(updateCommand(context))
        .command(verifyCommand(context))
        .demandCommand(1, "You need to provide a command.")
        .strict()
        .help();
}

/**
 * @internal
 */
/* istanbul ignore next */
/* v8 ignore next -- @preserve createParser covers this */
export async function cli(cwd: string, argv: string[]): Promise<void> {
    const context: Context = { cwd };
    await createParser(context)
        .fail((msg, err) => {
            if (err instanceof UserError) {
                console.error(err.prettyMessage());
            } else if (err instanceof Error) {
                console.error(err);
            } else {
                console.error(msg);
            }
            process.exit(1);
        })
        .parseAsync(argv);
}
