import fs from "node:fs";
import path from "node:path";
import { sortPackageJson } from "sort-package-json";
import { type default as yoctoSpinner } from "yocto-spinner";

import { NoApplicationFolderError } from "./errors";
import {
    type ApplicationPackageJson,
    info,
    readJsonFile,
    writeJsonFile,
} from "./utils";

/**
 * @internal
 */
export async function migrate(options: {
    templatePackage: string;
    cwd: string;
    env?: Record<string, string>;
    spinner?: ReturnType<typeof yoctoSpinner>;
}): Promise<void> {
    function text(newText: string): void {
        if (options.spinner) {
            options.spinner.text = newText;
        }
    }

    const { templatePackage, cwd, env = {} } = options;

    text("Installing template into existing application...");

    const clonemanVersion = await info<string>("cloneman", {
        field: "version",
        env,
    });

    const templateVersion = await info<string>(templatePackage, {
        field: "version",
        env,
    });

    if (!fs.existsSync(path.join(cwd, "package.json"))) {
        throw new NoApplicationFolderError();
    }

    const packageJson = await readJsonFile<ApplicationPackageJson>(
        path.join(cwd, "package.json"),
    );

    const devDependencies = packageJson.devDependencies ?? {};
    devDependencies["cloneman"] = clonemanVersion;
    devDependencies[templatePackage] = templateVersion;

    packageJson.cloneman = {
        templatePackage,
        version: "N/A",
    };

    await writeJsonFile(`${cwd}/package.json`, sortPackageJson(packageJson));
}
