import spawn from "nano-spawn";

/**
 * @public
 */

export async function getTemplateInfo(
    templatePackage: string,
    appPath: string,
): Promise<
    [filesDir: string, boilerplateFiles: string[], managedFiles: string[]]
> {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- technical debt
    const templateInfo = JSON.parse(getInfo.stdout);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- technical debt
    const filesDir: string = templateInfo.filesDir;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- technical debt
    const boilerplateFiles: string[] = templateInfo.boilerplateFiles;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- technical debt
    const managedFiles: string[] = templateInfo.managedFiles;
    return [filesDir, boilerplateFiles, managedFiles];
}
