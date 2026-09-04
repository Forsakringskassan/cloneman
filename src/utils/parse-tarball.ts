import { Readable } from "node:stream";
import { buffer as toBuffer } from "node:stream/consumers";
import { pipeline } from "node:stream/promises";
import { list } from "tar";
import { type PackageJson, type TemplatePackageJson } from "./package-json";

/**
 * The contents extracted from a cloneman template tarball.
 *
 * @internal
 */
export interface TarballContents {
    /** The parsed `package.json` from the tarball. */
    tarballPackageJson: TemplatePackageJson;
    /** The parsed `files/package.json` from the tarball (the template for consumer projects). */
    tmplPackageJson: PackageJson;

    /** Map of tarball entry paths (e.g. `package/files/managed.txt`) to their file contents. */
    files: Map<string, Buffer>;
}

/**
 * Parses a cloneman template tarball in-memory, extracting the `package.json`
 * and all files under `package/files/`.
 *
 * @internal
 * @param buffer - The raw tarball contents.
 * @returns The parsed package.json and a map of file paths to their contents.
 */
export async function parseTarball(buffer: Buffer): Promise<TarballContents> {
    const files = new Map<string, Buffer>();
    let packageJsonPromise: Promise<Buffer> | undefined;
    let tmplPackageJsonPromise: Promise<Buffer> | undefined;

    function readEntry(
        entry: Parameters<typeof toBuffer>[0] & { path: string },
    ): Promise<Buffer> {
        const content = toBuffer(entry);
        void content.then((data) => files.set(entry.path, data));
        return content;
    }

    const tarStream = list({
        onReadEntry(entry) {
            switch (entry.path) {
                case "package/package.json": {
                    packageJsonPromise = readEntry(entry);
                    break;
                }
                case "package/files/package.json": {
                    tmplPackageJsonPromise = readEntry(entry);
                    break;
                }
                default: {
                    void readEntry(entry);
                    break;
                }
            }
        },
    });

    await pipeline(Readable.from(buffer), tarStream);

    if (!packageJsonPromise) {
        throw new Error("Could not find package.json in tarball");
    }

    if (!tmplPackageJsonPromise) {
        throw new Error("Could not find files/package.json in tarball");
    }

    const packageJsonBuffer = await packageJsonPromise;
    const tarballPackageJson = JSON.parse(
        packageJsonBuffer.toString("utf8"),
    ) as TemplatePackageJson;

    const tmplPackageJsonBuffer = await tmplPackageJsonPromise;
    const tmplPackageJson = JSON.parse(
        tmplPackageJsonBuffer.toString("utf8"),
    ) as PackageJson;

    return { tarballPackageJson, tmplPackageJson, files };
}
