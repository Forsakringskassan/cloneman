import path from "node:path";
import {
    InvalidClonemanFieldError,
    MissingClonemanFieldError,
    TemplateDependencyMissingError,
    TemplateFileHashMismatchError,
    TemplateVersionMismatchError,
} from "./errors";
import {
    type ApplicationPackageJson,
    fetchTarball,
    isClientMetadata,
    parseTarball,
    readJsonFile,
} from "./utils";

/**
 * @internal
 * @returns `true` if the application is up-to-date.
 */
export async function verify(options: {
    /** The path to the user's application. */
    applicationPath: string;
    managedFilesOnly: boolean;
    env: Record<string, string>;
}): Promise<void> {
    const { applicationPath } = options;
    const filePath = path.join(applicationPath, "package.json");
    const pkg = await readJsonFile<ApplicationPackageJson>(filePath);
    const { cloneman, devDependencies = {} } = pkg;

    if (cloneman === undefined) {
        throw new MissingClonemanFieldError();
    }
    if (!isClientMetadata(cloneman)) {
        throw new InvalidClonemanFieldError(cloneman);
    }

    const dependencyVersion = devDependencies[cloneman.template];
    const templateVersion = cloneman.version;
    const templateName = cloneman.template;

    if (!dependencyVersion) {
        throw new TemplateDependencyMissingError({
            templateName,
            templateVersion,
        });
    }

    if (options.managedFilesOnly) {
        const tarball = await fetchTarball(
            templateName,
            dependencyVersion,
            options.env,
        );

        const { tmplPackageJson } = await parseTarball(tarball);

        if (!isClientMetadata(tmplPackageJson.cloneman)) {
            throw new InvalidClonemanFieldError(tmplPackageJson.cloneman);
        }

        const currentFileHash = cloneman.fileHash ?? "";
        const expectedFileHash = tmplPackageJson.cloneman.fileHash ?? "";

        if (currentFileHash !== expectedFileHash) {
            throw new TemplateFileHashMismatchError({
                templateName,
                templateVersion,
                currentFileHash,
                expectedFileHash,
            });
        }
    } else if (dependencyVersion !== templateVersion) {
        throw new TemplateVersionMismatchError({
            templateName,
            templateVersion,
            dependencyVersion,
        });
    }
}
