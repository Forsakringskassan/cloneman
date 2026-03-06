import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { readJsonFile } from "./utils";
import { getTemplateInfo } from "./utils/get-template-info";
import { type PackageJson } from "./utils/package-json";
/**
 * @internal
 */
export async function update(
    cwd: string,
    version: string,
    env: Record<string, string> = {},
): Promise<void> {
    console.log(`Updating template package to version ${version}...`);

    const packageJson = await readJsonFile<PackageJson>(
        path.join(cwd, "package.json"),
    );

    console.log(packageJson);

    if (!packageJson.cloneman) {
        throw new Error(
            "Cannot update application: missing 'cloneman' field in package.json",
        );
    }
    const templatePackage = packageJson.cloneman as string;

    await spawn(
        "npm",
        [
            "install",
            "--save-dev",
            "--save-exact",
            `${templatePackage}@${version}`,
        ],
        {
            cwd,
            env,
        },
    );

    const [filesDir, , managedFiles] = await getTemplateInfo(
        templatePackage,
        cwd,
    );

    await Promise.all(
        managedFiles.map((filename) => {
            console.log(filename);
            return fs.copyFile(
                path.join(filesDir, filename),
                path.join(cwd, filename),
            );
        }),
    );

    return Promise.resolve();
}
