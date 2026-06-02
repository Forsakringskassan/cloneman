import spawn from "nano-spawn";
import { type Parameter } from "../types";

/**
 * @internal
 */
export interface TemplateInfo {
    readonly filesDir: string;
    readonly hooksDir: string | null;
    readonly boilerplateFiles: string[];
    readonly managedFiles: string[];
    readonly parameters: Parameter[];
}

/**
 * @internal
 */
export async function getTemplateInfo(
    templatePackage: string,
    appPath: string,
): Promise<TemplateInfo> {
    let getInfo;
    try {
        getInfo = await spawn(
            "node",
            [
                "--input-type=module",
                "-e",
                `console.log(JSON.stringify((await import('${templatePackage}')).default));`,
            ],
            {
                cwd: appPath,
            },
        );
    } catch {
        throw new Error(
            `Package ${templatePackage} is not a valid cloneman template package`,
        );
    }

    const templateInfo = JSON.parse(getInfo.stdout) as {
        filesDir: string;
        hooksDir?: string;
        boilerplateFiles: string[];
        managedFiles: string[];
        parameters?: Parameter[];
    };

    const { filesDir, hooksDir, boilerplateFiles, managedFiles, parameters } =
        templateInfo;
    return {
        filesDir,
        hooksDir: hooksDir ?? null,
        boilerplateFiles,
        managedFiles,
        parameters: parameters ?? [],
    };
}
