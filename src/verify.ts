import path from "node:path";
import isCI from "is-ci";
import {
    InvalidClonemanFieldError,
    MissingClonemanFieldError,
    TemplateDependencyMissingError,
    TemplateVersionMismatchError,
} from "./errors";
import {
    type ApplicationPackageJson,
    isClientMetadata,
    readJsonFile,
} from "./utils";

/**
 * @internal
 * @returns `true` if the application is up-to-date.
 */
export async function verify(options: {
    /** The path to the user's application. */
    applicationPath: string;
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

    if (dependencyVersion !== templateVersion) {
        const error = new TemplateVersionMismatchError({
            templateName,
            templateVersion,
            dependencyVersion,
        });

        if (isCI) {
            throw error;
        }

        console.error(error.prettyMessage());
    }
}
