import fs from "node:fs";
import path from "node:path";
import { sortPackageJson } from "sort-package-json";
import { type default as yoctoSpinner } from "yocto-spinner";

import { NoApplicationFolderError } from "./errors";
import { type ClientMetadata } from "./types";
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

    /* npm 11 returns string, npm 12 returns array with a single string */
    const clonemanVersion = await info<string | [string]>("cloneman", {
        field: "version",
        env,
    });

    /* npm 11 returns string, npm 12 returns array with a single string */
    const templateVersion = await info<string | [string]>(templatePackage, {
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
    devDependencies["cloneman"] = Array.isArray(clonemanVersion)
        ? clonemanVersion[0]
        : clonemanVersion;
    devDependencies[templatePackage] = Array.isArray(templateVersion)
        ? templateVersion[0]
        : templateVersion;

    packageJson.cloneman = {
        template: templatePackage,
        version: "N/A",
    } satisfies ClientMetadata;

    await writeJsonFile(`${cwd}/package.json`, sortPackageJson(packageJson), {
        indent: 2,
        trailer: "\n",
    });
}
