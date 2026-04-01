import yargs from "yargs";
import { name } from "../../package.json";
import { type Context } from "./context";
import { createCommand } from "./create";
import { packCommand } from "./pack";
import { publishCommand } from "./publish";
import { updateCommand } from "./update";

/**
 * @internal
 */
export function createParser(context: Context): ReturnType<typeof yargs> {
    return yargs()
        .scriptName(name)
        .command(createCommand(context))
        .command(updateCommand(context))
        .command(packCommand(context))
        .command(publishCommand(context))
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
    await createParser(context).parseAsync(argv);
}
