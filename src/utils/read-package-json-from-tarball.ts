import { t } from "tar";
import { type TemplatePackageJson } from "./package-json";

/**
 * Read `package.json` from a local `.tgz` tarball in memory.
 */
export async function readPackageJsonFromTarball(
    tarballPath: string,
): Promise<TemplatePackageJson> {
    const packageJsonPath = "package/package.json";
    const chunks: Buffer[] = [];

    try {
        await t(
            {
                file: tarballPath,
                filter: (path) => path === packageJsonPath,
                onentry: (entry) => {
                    entry.on("data", (chunk: Buffer) => chunks.push(chunk));
                },
            },
            [packageJsonPath],
        );
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            throw new Error(`Tarball not found at path "${tarballPath}"`);
        }

        throw error;
    }

    if (chunks.length === 0) {
        throw new Error(
            `Could not find package.json in tarball "${tarballPath}"`,
        );
    }

    const content = Buffer.concat(chunks).toString("utf8");
    return JSON.parse(content) as TemplatePackageJson;
}
