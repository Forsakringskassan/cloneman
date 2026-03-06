import { writeJsonFile } from "../../utils";
import { type PackageJson } from "../../utils/package-json";

export async function createclonemanPackageJson(
    dst: string,
    options: {
        name: string;
        version: string;
        boilerplateFiles: string[];
        managedFiles: string[];
    },
): Promise<PackageJson> {
    const { name, version, boilerplateFiles, managedFiles } = options;
    const pkg = {
        name,
        version,
        cloneman: {
            boilerplateFiles,
            managedFiles,
        },
    };

    await writeJsonFile(dst, pkg);

    return pkg;
}
