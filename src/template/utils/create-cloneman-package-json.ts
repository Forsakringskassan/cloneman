import { writeJsonFile } from "../../utils";
import { type TemplatePackageJson } from "../../utils/package-json";

export async function createclonemanPackageJson(
    dst: string,
    options: {
        name: string;
        version: string;
        boilerplateFiles: string[];
        managedFiles: string[];
        uninstallDependencies: string[];
        ignoredDependencies: string[];
    },
): Promise<TemplatePackageJson> {
    const {
        name,
        version,
        boilerplateFiles,
        managedFiles,
        ignoredDependencies,
        uninstallDependencies,
    } = options;
    const pkg: TemplatePackageJson = {
        name,
        type: "module",
        version,
        exports: {
            ".": "./index.js",
        },
        cloneman: {
            boilerplateFiles,
            managedFiles,
            uninstallDependencies,
            ignoredDependencies,
        },
    };

    await writeJsonFile(dst, pkg);

    return pkg;
}
