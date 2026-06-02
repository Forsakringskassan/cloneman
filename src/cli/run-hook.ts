import path from "node:path";
import { type CommandModule } from "yargs";
import { type HookMapping } from "../hooks";
import {
    type PackageJson,
    createInstallContext,
    findHookScriptPath,
    readJsonFile,
    runHook,
} from "../utils";
import { type Context } from "./context";
import { parseParams } from "./parse-params";

interface RunHookArguments {
    hook: keyof HookMapping;
    target: string | undefined;
    param: string[];
}

async function runHookHandler(
    context: Context,
    argv: RunHookArguments,
): Promise<boolean> {
    const { cwd } = context;
    const { hook, target: targetDir = cwd, param } = argv;
    const parameters = parseParams(param);
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
            let message = "";
            const context = createInstallContext({
                command: "update",
                targetDir,
                name: targetPkgJson.name,
                parameters,
                version: {
                    oldVersion: null,
                    newVersion: cwdPkgJson.version,
                },
                setMessage(text) {
                    message = text;
                },
            });
            await runHook(hook, hooksDir, context);
            if (message !== "") {
                console.log(
                    "The hook produced the following instruction message:",
                );
                console.group("");
                console.log(message);
                console.groupEnd();
            }
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
                })
                .option("param", {
                    describe: "Override a template parameter (key=value)",
                    type: "string",
                    array: true,
                    default: [],
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
