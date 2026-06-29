import {
    type PackageJson,
    type TemplatePackageJson,
    writeJsonFile,
} from "../../utils";

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
        removeFiles,
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
