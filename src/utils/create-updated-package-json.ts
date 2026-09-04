import { APPLICATION_OWNED_FIELDS } from "../properties";
import { type ClientMetadata } from "../types";

import { type PackageJson } from "./package-json";

function sort(packageJson: PackageJson, reference: PackageJson): PackageJson {
    const fields = new Set([
        ...Object.keys(reference),
        ...Object.keys(packageJson),
    ]);

    const sorted: Record<string, unknown> = {};

    for (const field of fields) {
        const value = packageJson[field as keyof PackageJson];
        if (Object.hasOwn(packageJson, field) && value !== undefined) {
            sorted[field] = value;
        }
    }

    return sorted as unknown as PackageJson;
}
/**
 * @internal
 */

export interface CreateUpdatedPackageJsonOptions {
    /** package.json in application before updating */
    currentPackageJson: PackageJson;

    /** package.json from template (files/package.json) */
    templatePackageJson: PackageJson;

    /** npm tarball package.json (from the template) */
    tarballPackageJson: PackageJson;

    /** New version (or tarball path if updating from local file) */
    version: string;

    /** List of dependencies to append to generated package.json */
    dependencies: NonNullable<PackageJson["dependencies"]>;

    /** List of devDependencies */
    devDependencies: NonNullable<PackageJson["devDependencies"]>;

    /** Map of template specific parameters */
    parameters: Map<string, string>;

    /** Generated hash of the template files */
    fileHash: string;
}

/**
 * @internal
 */
export function createUpdatedPackageJson(
    options: CreateUpdatedPackageJsonOptions,
): PackageJson {
    const {
        currentPackageJson,
        templatePackageJson,
        dependencies,
        devDependencies,
        tarballPackageJson,
        parameters,
        fileHash,
        version,
    } = options;
    const packageJson: PackageJson = {
        ...templatePackageJson,
        dependencies,
        devDependencies: {
            ...devDependencies,
            [tarballPackageJson.name]: version,
        },
        cloneman: {
            version: tarballPackageJson.version,
            template: tarballPackageJson.name,
            parameters: Object.fromEntries(parameters),
            fileHash,
        } satisfies ClientMetadata,
    };

    for (const field of APPLICATION_OWNED_FIELDS) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment -- no user input
        packageJson[field] = currentPackageJson[field] as any;
    }

    return sort(packageJson, currentPackageJson);
}
