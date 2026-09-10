import {
    type PackageJson,
    type TemplatePackageJson,
    writeJsonFile,
} from "../../utils";
import { type PartiallyManagedFile } from "../../utils/package-json";

export async function createclonemanPackageJson(
    dst: string,
    options: Pick<
        PackageJson,
        | "name"
        | "version"
        | "description"
        | "keywords"
        | "homepage"
        | "bugs"
        | "repository"
        | "license"
        | "author"
    > & {
        boilerplateFiles: string[];
        managedFiles: string[];
        partiallyManagedFiles: PartiallyManagedFile[];
        removeFiles: string[];
        uninstallDependencies: string[];
        ignoredDependencies: string[];
    },
): Promise<TemplatePackageJson> {
    const {
        name,
        version,
        description,
        keywords,
        homepage,
        bugs,
        repository,
        license,
        author,
        boilerplateFiles,
        managedFiles,
        partiallyManagedFiles,
        removeFiles, // eslint-disable-line unicorn/no-non-function-verb-prefix -- cannot be changed until next major
        ignoredDependencies,
        uninstallDependencies,
    } = options;
    const pkg: TemplatePackageJson = {
        name,
        version,
        description,
        keywords,
        homepage,
        bugs,
        repository,
        license,
        author,
        type: "module",
        exports: {
            ".": "./index.js",
        },
        cloneman: {
            boilerplateFiles,
            managedFiles,
            partiallyManagedFiles,
            removeFiles,
            uninstallDependencies,
            ignoredDependencies,
        },
    };

    await writeJsonFile(dst, pkg, {
        indent: 2,
        trailer: "\n",
    });

    return pkg;
}
