import fs from "node:fs/promises";
import path from "node:path";
import {
    type NormalizedTemplateConfig,
    type TemplateConfig,
    normalizeTemplateConfig,
} from "../config";
import {
    ManagedFileMissingError,
    ParameterDuplicateKeyError,
    ParameterInvalidKeyError,
} from "../errors";
import { type Parameter } from "../types";
import {
    type PackageJson,
    readJsonFile,
    replaceInFile,
    writeJsonFile,
} from "../utils";
import { installHook } from "./install-hook";
import { updateJson } from "./update-json";
import {
    copyFiles,
    createclonemanPackageJson,
    prepareTemplatePackageJson,
    updateRenovateWithIgnoredDeps,
} from "./utils";
import { formatWithPrettier } from "./utils/format-with-prettier";
import { writeFile } from "./write-file";

/**
 * @public
 * @since v1.2.0
 */
export interface BuildTemplateResult {
    /**
     * Declares a parameter that this template requires from the user.
     *
     * Parameters are collected at `create`/`update` time (interactively or via
     * `--param key=value`).
     *
     * Parameters must not be used for sensitive information such as API keys,
     * passwords, etc. Parameters are persisted in plain-text in the
     * application.
     *
     * @example
     * ```ts
     * template.addParameter("foo", {
     *     description: "What should foo be set to",
     *     required: true,
     * });
     * ```
     *
     * @public
     * @since v1.17.0
     * @see https://github.com/Forsakringskassan/cloneman/blob/main/docs/templates.md#addparameter
     * @param key - Parameter key (used when retrieving parameter in other hooks). Key must be `[a-z0-9-]+`..
     * @param definition - The parameter definition.
     */
    addParameter(
        key: string,
        definition?: Partial<Omit<Parameter, "key">>,
    ): void;

    /**
     * Replaces content in file. Each occurrence of `pattern` is replaced by
     * `replacement`.
     *
     * When passing in a regular expression as pattern, make sure to use the
     * global flag `/g` if you intend to replace multiple matches. Default is to
     * replace the first occurrence only.
     *
     * Replacement occurs line-by-line.
     *
     * @public
     * @since v1.20.0
     * @param filePath - Path relative to application root.
     * @param pattern - Pattern to replace in file.
     * @param replacement - Value to replace pattern with.
     * @returns A promise resolved when the updated file has been written.
     */
    replaceInFile(
        filePath: string,
        pattern: string | RegExp,
        replacement: string,
    ): Promise<void>;

    /**
     * Replaces content in file. For each line matching `matcher`, each
     * occurrence of `pattern` is replaced by `replacement`.
     *
     * When passing in a regular expression as pattern make sure to use the
     * global flag `/g`.
     *
     * Replacement occurs line-by-line.
     *
     * @public
     * @since v1.20.0
     * @param filePath - Path relative to application root.
     * @param matcher - RegExp to match a specific line to perform replacements on.
     * @param pattern - Pattern to replace in file.
     * @param replacement - Value to replace pattern with.
     * @returns A promise resolved when the updated file has been written.
     */
    replaceInFile(
        filePath: string,
        matcher: RegExp,
        pattern: string | RegExp,
        replacement: string,
    ): Promise<void>;

    /**
     * Updates the content of the JSON file at given path with given content.
     *
     * - Objects are updated recursively, keys set to `undefined` are removed
     *   from the target object.
     * - Arrays are always replaced.
     *
     * Indentation and trailing newline is preserved if present.
     *
     * @public
     * @since v1.5.0
     * @param filePath - Path relative to the template root.
     * @param content - Content to add to the existing JSON.
     * @returns A promise resolved when the updated file has been written.
     */
    updateJson(this: void, filePath: string, content: unknown): Promise<void>;

    /**
     * Append template specific dependencies to the "ignoreDeps" array in the template's "renovate.json".
     */
    renovateIgnoreDependencies(): Promise<void>;

    /**
     * List of files included in the template
     */
    readonly files: string[];

    /**
     * Writes a file to the template's file directory.
     *
     * @public
     * @since v1.8.0
     * @param filePath - Path relative to the template root.
     * @param content - Content to write to the file.
     * @returns A promise resolved when the file has been written.
     */
    writeFile(filePath: string, content: string): Promise<void>;
}

/**
 * Builds a cloneman template.
 *
 * @internal
 */
export async function buildTemplate(options: {
    logger: Console;
    name: string;
    templateDir: string;
    targetDir: string;
    config: TemplateConfig | NormalizedTemplateConfig;
    parameters: Parameter[];
}): Promise<BuildTemplateResult> {
    const { logger, name, templateDir, targetDir, config, parameters } =
        options;
    const pkgJsonPath = path.join(templateDir, "package.json");
    const pkg = await readJsonFile<PackageJson>(pkgJsonPath);

    logger.group(`Assembling cloneman template "${name}@${pkg.version}"`);

    const filesDir = path.join(targetDir, "files");
    await prepareFolders(targetDir, filesDir);

    const templateConfig = normalizeTemplateConfig(config);
    const {
        managedFiles,
        ignoredFiles: templateIgnoredFiles,
        removeFiles, // eslint-disable-line unicorn/no-non-function-verb-prefix -- cannot be changed until next major
        ignoredDependencies: templateIgnoredDependencies,
        uninstallDependencies,
    } = templateConfig;

    const ignoredFiles = [
        ...templateIgnoredFiles,
        "package.json",
        ".cloneman/**",
    ];

    const indexJs = `
        import fs from "node:fs/promises";
        import path from "node:path";

        const packageJsonFile = await fs.readFile(path.join(import.meta.dirname, "package.json"), "utf8");
        const packageJson = JSON.parse(packageJsonFile);

        const options = {
            ...packageJson.cloneman,
            filesDir: path.join(import.meta.dirname, "files"),
            hooksDir: path.join(import.meta.dirname, "hooks"),
        }

        export default options;
    `;

    const files = await copyFiles(logger, templateDir, filesDir, ignoredFiles);
    const effectiveManagedFiles = files.filter((it) => {
        return managedFiles.some((pattern) => path.matchesGlob(it, pattern));
    });

    /* verify each pattern in managedFiles matches one or more files */
    for (const pattern of managedFiles) {
        if (files.every((it) => !path.matchesGlob(it, pattern))) {
            throw new ManagedFileMissingError({
                templateName: name,
                file: pattern,
            });
        }
    }

    const hooksDir = path.join(templateDir, ".cloneman");
    await installHook("install", { targetDir, hooksDir });

    await fs.writeFile(path.join(targetDir, "index.js"), indexJs);

    const clonemanPackageJson = await createclonemanPackageJson(
        path.join(targetDir, "package.json"),
        {
            name,
            version: pkg.version,
            description: pkg.description,
            keywords: pkg.keywords,
            homepage: pkg.homepage,
            bugs: pkg.bugs,
            repository: pkg.repository,
            license: pkg.license,
            author: pkg.author,
            boilerplateFiles: files.toSorted((a, b) => a.localeCompare(b)),
            removeFiles,
            uninstallDependencies,
            ignoredDependencies: templateIgnoredDependencies,
            managedFiles: effectiveManagedFiles.toSorted((a, b) => {
                return a.localeCompare(b);
            }),
        },
    );

    const massagedTemplatePackageJson = prepareTemplatePackageJson(
        clonemanPackageJson,
        pkg,
    );

    await writeJsonFile(
        path.join(filesDir, "package.json"),
        massagedTemplatePackageJson,
        {
            indent: 2,
            trailer: "\n",
        },
    );

    logger.groupEnd();

    return {
        addParameter(key, definition) {
            if (!/^[\da-z-]+$/.test(key)) {
                throw new ParameterInvalidKeyError({ key });
            }
            if (parameters.some((it) => it.key === key)) {
                throw new ParameterDuplicateKeyError({ key });
            }
            parameters.push({
                key,
                description: "",
                help: null,
                required: false,
                ...definition,
            });
        },
        replaceInFile(
            filePath: string,
            ...args:
                | [pattern: string | RegExp, replacement: string]
                | [
                      matcher: RegExp,
                      pattern: string | RegExp,
                      replacement: string,
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
        updateJson: updateJson.bind(undefined, { filesDir }),
        renovateIgnoreDependencies() {
            return renovateIgnoreDependencies(
                massagedTemplatePackageJson,
                clonemanPackageJson.name,
                templateConfig,
                filesDir,
                managedFiles,
            );
        },
        writeFile: writeFile.bind(undefined, { filesDir }),
        files,
    };
}

async function prepareFolders(
    targetDir: string,
    filesDir: string,
): Promise<void> {
    await fs.rm(targetDir, { recursive: true, force: true });
    await fs.mkdir(filesDir, { recursive: true });
}

async function renovateIgnoreDependencies(
    packageJson: PackageJson,
    templatePackageName: string,
    templateConfig: TemplateConfig,
    filesDir: string,
    managedFiles: string[],
): Promise<void> {
    if (!managedFiles.includes("renovate.json")) {
        return;
    }

    const renovateFilePath = path.join(filesDir, "renovate.json");

    const renovateConfig =
        await readJsonFile<Record<string, unknown>>(renovateFilePath);

    const newConfig = updateRenovateWithIgnoredDeps(
        renovateConfig,
        packageJson,
        templatePackageName,
        templateConfig,
    );
    await writeJsonFile(renovateFilePath, newConfig, {
        indent: 4,
        trailer: "\n",
    });

    await formatWithPrettier(renovateFilePath);
}
