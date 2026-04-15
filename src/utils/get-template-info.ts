import spawn from "nano-spawn";

/**
 * @internal
 */
export interface TemplateInfo {
    readonly filesDir: string;
    readonly boilerplateFiles: string[];
    readonly managedFiles: string[];
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
        boilerplateFiles: string[];
        managedFiles: string[];
    };

    const { filesDir, boilerplateFiles, managedFiles } = templateInfo;
    return { filesDir, boilerplateFiles, managedFiles };
}
