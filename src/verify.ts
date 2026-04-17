import path from "node:path";
import {
    InvalidClonemanFieldError,
    MissingClonemanFieldError,
    TemplateDependencyMissingError,
    TemplateVersionMismatchError,
} from "./errors";
import { isClientMetadata, readJsonFile } from "./utils";
import { type ApplicationPackageJson } from "./utils/package-json";

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
    } else if (!isClientMetadata(cloneman)) {
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
        throw new TemplateVersionMismatchError({
            templateName,
            templateVersion,
            dependencyVersion,
        });
    }
}
