import path from "node:path";
import { sortPackageJson } from "sort-package-json";
import { writeJsonFile } from "../../utils";
import { type PackageJson } from "../../utils/package-json";

export async function createMassagedTemplatePackageJson(
    template: PackageJson,
    pkg: PackageJson,
    appConfig: { dependencies: string[] },
    dstDir: string,
): Promise<void> {
    const massaged = {
        ...pkg,
        name: "${name}",
        description: "${description}",
        version: "${version}",
        cloneman: template.name,
        dependencies: filterDependencies(pkg.dependencies ?? {}, appConfig),
        devDependencies: {
            ...filterDependencies(pkg.devDependencies ?? {}, appConfig),
            [template.name]: template.version,
        },
    } satisfies PackageJson;
    delete massaged.devDependencies["cloneman"];

    const distPackageJson = sortPackageJson(massaged);

    await writeJsonFile(path.join(dstDir, "package.json"), distPackageJson);

    console.log("package.json generated");
}

function filterDependencies(
    dependencies: Record<string, string>,
    appConfig: { dependencies: string[] },
): Record<string, string> {
    const foo = Object.entries(dependencies).filter(([key, _value]) => {
        // globbar senare
        return !appConfig.dependencies.includes(key);
    });

    return Object.fromEntries(foo);
}
