import { type Console } from "node:console";
import fs from "node:fs/promises";
import path from "node:path";
import { type InstallContext } from "../hooks";
import { getApplicationName } from "./get-application-name";
import { getApplicationSelector } from "./get-application-selector";
import { getApplicationSlug } from "./get-application-slug";
import { readJsonFile } from "./read-json-file";
import { updateJsonFile } from "./update-json-file";
import { writeJsonFile } from "./write-json-file";

/**
 * @internal
 */
export function createInstallContext(options: {
    command: "create" | "update";
    targetDir: string;
    name: string;
    version: { oldVersion: string | null; newVersion: string };
    logger?: Console;
    setMessage(this: void, text: string): void;
}): InstallContext {
    const {
        command,
        targetDir,
        name,
        version,
        logger = console,
        setMessage,
    } = options;
    return {
        targetDir,
        relativeTargetDir: path.relative(process.cwd(), targetDir),
        logger,
        command,
        version,
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
    };
}
