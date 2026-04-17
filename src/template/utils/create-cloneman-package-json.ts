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
    },
): Promise<TemplatePackageJson> {
    const {
        name,
        version,
        boilerplateFiles,
        managedFiles,
        uninstallDependencies,
    } = options;
    const pkg = {
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
        },
    };

    await writeJsonFile(dst, pkg);

    return pkg;
}
