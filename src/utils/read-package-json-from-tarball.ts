import { existsSync } from "node:fs";
import { list } from "tar";
import { type TemplatePackageJson } from "./package-json";

/**
 * Read `package.json` from a local `.tgz` tarball in memory.
 *
 * @internal
 * @param tarballPath - Path to the `.tgz` file.
 */
export async function readPackageJsonFromTarball(
    tarballPath: string,
): Promise<TemplatePackageJson> {
    const chunks: Buffer[] = [];

    if (!existsSync(tarballPath)) {
        throw new Error(`Tarball not found at path "${tarballPath}"`);
    }

    await list({
        file: tarballPath,
        onReadEntry(entry) {
            if (entry.path === "package/package.json") {
                entry.on("data", (chunk: Buffer) => chunks.push(chunk));
            } else {
                entry.resume();
            }
        },
    });

    if (chunks.length === 0) {
        throw new Error(
            `Could not find package.json in tarball "${tarballPath}"`,
        );
    }

    const content = Buffer.concat(chunks).toString("utf-8");
    return JSON.parse(content) as TemplatePackageJson;
}
