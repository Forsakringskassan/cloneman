import path from "node:path";
import { type CommandModule } from "yargs";
import { type HookMapping } from "../hooks";
import {
    createInstallContext,
    findHookScriptPath,
    readJsonFile,
    runHook,
} from "../utils";
import { type PackageJson } from "../utils/package-json";
import { type Context } from "./context";

interface RunHookArguments {
    hook: keyof HookMapping;
    target: string | undefined;
}

async function runHookHandler(
    context: Context,
    argv: RunHookArguments,
): Promise<boolean> {
    const { cwd } = context;
    const { hook, target: targetDir = cwd } = argv;
    const hooksDir = path.join(cwd, ".cloneman");

    if (!findHookScriptPath(hook, hooksDir)) {
        console.error(`No "${hook}" hook found`);
        return false;
    }

    const [cwdPkgJson, targetPkgJson] = await Promise.all([
        readJsonFile<PackageJson>(path.join(cwd, "package.json")),
        readJsonFile<PackageJson>(path.join(targetDir, "package.json")),
    ]);

    switch (hook) {
        case "install": {
            const context = createInstallContext({
                targetDir,
                name: targetPkgJson.name,
                version: {
                    oldVersion: null,
                    newVersion: cwdPkgJson.version,
                },
            });
            await runHook(hook, hooksDir, context);
            return true;
        }
        case "build":
            return false;
    }

    /* unreachable (exhaustive switch) */
}

/**
 * @internal
 */
export function runHookCommand(
    context: Context,
): CommandModule<object, RunHookArguments> {
    return {
        command: "run-hook <hook>",
        describe: "Run a template hook",
        builder(yargs) {
            return yargs
                .positional("hook", {
                    describe: "Hook to run",
                    type: "string",
                    choices: ["install"] as const,
                    demandOption: true,
                })
                .option("target", {
                    describe: "Target directory (defaults to cwd)",
                    type: "string",
                });
        },
        async handler(argv) {
            const ok = await runHookHandler(context, argv);
            if (!ok) {
                process.exitCode = 1;
            }
        },
    };
}
