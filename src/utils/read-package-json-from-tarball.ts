import { access } from "node:fs/promises";
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

    try {
        await access(tarballPath);
    } catch {
        throw new Error(`Tarball not found at path "${tarballPath}"`);
    }

    await list({
        file: tarballPath,
        filter: (entryPath) => entryPath === "package/package.json",
        onReadEntry(entry) {
            entry.on("data", (chunk: Buffer) => chunks.push(chunk));
        },
    });

    if (chunks.length === 0) {
        throw new Error(
            `Could not find package.json in tarball "${tarballPath}"`,
        );
    }

    const content = Buffer.concat(chunks).toString("utf8");
    return JSON.parse(content) as TemplatePackageJson;
}
