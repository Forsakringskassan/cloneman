import { type Console } from "node:console";
import type nodeFs from "node:fs/promises";
import path from "node:path";
import {
    getApplicationSelector,
    getApplicationSlug,
} from "@forsakringskassan/get-application-slug";
import { ParameterNotDeclaredError } from "../errors";
import { type InstallContext } from "../hooks";
import type { EnsureFileOptions } from "../hooks/install-context";
import { getApplicationName } from "./get-application-name";
import { readJsonFile } from "./read-json-file";
import { replaceInFile } from "./replace-in-file";
import { updateJsonFile } from "./update-json-file";
import { writeJsonFile } from "./write-json-file";

async function fileExists(
    fs: typeof nodeFs,
    filename: string,
): Promise<boolean> {
    try {
        await fs.access(filename);
        return true;
    } catch {
        return false;
    }
}

/**
 * @internal
 */
export function createInstallContext(options: {
    command: "create" | "update";
    targetDir: string;
    name: string;
    version: { oldVersion: string | null; newVersion: string };
    logger?: Console;
    fs: typeof nodeFs;
    parameters: Map<string, string>;
    setMessage(this: void, text: string): void;
}): InstallContext {
    const {
        command,
        targetDir,
        name,
        version,
        logger = console,
        parameters,
        fs,
        setMessage,
    } = options;
    return {
        targetDir,
        relativeTargetDir: path.relative(process.cwd(), targetDir),
        logger,
        command,
        version,
        async ensureFile(filePath, userOptions) {
            const defaultOptions: EnsureFileOptions = { content: "" };
            const options = { ...defaultOptions, ...userOptions };

            const filename = path.join(targetDir, filePath);
            const content = options.content ?? "";

            await fs.mkdir(path.dirname(filename), { recursive: true });

            if (await fileExists(fs, filename)) {
                return;
            }

            await fs.writeFile(filename, content);
        },
        getApplicationName(opts) {
            return getApplicationName(name, {
                unscoped: false,
                ...opts,
            });
        },
        getApplicationSlug() {
            return getApplicationSlug(name);
        },
        getApplicationSelector() {
            return getApplicationSelector(name);
        },
        readFile(filePath) {
            return fs.readFile(path.join(targetDir, filePath), "utf8");
        },
        readJsonFile<T>(filePath: string) {
            return readJsonFile<T>(path.join(targetDir, filePath));
        },
        async renameFile(oldPath: string, newPath: string, userOptions) {
            const defaultOptions = { graceful: false };
            const options = { ...defaultOptions, ...userOptions };
            try {
                await fs.rename(
                    path.join(targetDir, oldPath),
                    path.join(targetDir, newPath),
                );
            } catch (error: unknown) {
                if (options.graceful) {
                    return;
                }

                throw error;
            }
        },
        replaceInFile(
            filePath: string,
            ...args:
                | [
                      pattern: string | RegExp,
                      replacement:
                          | string
                          | ((match: string, ...args: string[]) => string),
                  ]
                | [
                      matcher: RegExp,
                      pattern: string | RegExp,
                      replacement:
                          | string
                          | ((match: string, ...args: string[]) => string),
                  ]
        ) {
            const [match, pattern, replacement] =
                args.length === 3 ? args : [undefined, ...args];
            return replaceInFile(path.join(targetDir, filePath), {
                match,
                pattern,
                replacement,
            });
        },
        writeFile(filePath, content) {
            return fs.writeFile(
                path.join(targetDir, filePath),
                content,
                "utf8",
            );
        },
        writeJsonFile(filePath, content) {
            return writeJsonFile(path.join(targetDir, filePath), content, {
                indent: 2,
                trailer: "",
            });
        },
        updateJsonFile(filePath, content) {
            return updateJsonFile(path.join(targetDir, filePath), content);
        },
        setMessage(text, delimiter = "\n") {
            setMessage(Array.isArray(text) ? text.join(delimiter) : text);
        },
        getParameter(key) {
            const value = parameters.get(key);
            if (value === undefined) {
                throw new ParameterNotDeclaredError({
                    hook: "install",
                    parameter: key,
                });
            }
            return value;
        },
    };
}
