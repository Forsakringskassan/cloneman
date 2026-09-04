import { APPLICATION_OWNED_FIELDS } from "../properties";
import { type ClientMetadata } from "../types";

import { type PackageJson } from "./package-json";

function sort(packageJson: PackageJson, reference: PackageJson): PackageJson {
    const fields = new Set([
        ...Object.keys(reference),
        ...Object.keys(packageJson),
    ]);
    return Object.fromEntries(
        Array.from(fields)
            .filter((field) => Object.hasOwn(packageJson, field))
            .map((field) => [field, packageJson[field as keyof PackageJson]]),
    ) as unknown as PackageJson;
}

/**
 * @internal
 */
export function createUpdatedPackageJson(options: {
    currentPackageJson: PackageJson;
    templatePackageJson: PackageJson;
    dependencies: NonNullable<PackageJson["dependencies"]>;
    devDependencies: NonNullable<PackageJson["devDependencies"]>;
    tarballPackageJson: PackageJson;
    parameters: Map<string, string>;
    fileHash: string;
}): PackageJson {
    const {
        currentPackageJson,
        templatePackageJson,
        dependencies,
        devDependencies,
        tarballPackageJson,
        parameters,
        fileHash,
    } = options;
    const packageJson: PackageJson = {
        ...templatePackageJson,
        dependencies,
        devDependencies: {
            ...devDependencies,
            [tarballPackageJson.name]: tarballPackageJson.version,
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
