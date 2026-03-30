import { Readable } from "node:stream";
import { buffer as toBuffer } from "node:stream/consumers";
import { pipeline } from "node:stream/promises";
import { list } from "tar";
import { type TemplatePackageJson } from "./package-json";

/**
 * The contents extracted from a cloneman template tarball.
 *
 * @internal
 */
export interface TarballContents {
    /** The parsed `package.json` from the tarball. */
    packageJson: TemplatePackageJson;
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

    const tarStream = list({
        onReadEntry(entry) {
            if (entry.path === "package/package.json") {
                packageJsonPromise = toBuffer(entry);
            } else if (entry.path.startsWith("package/files/")) {
                const { path } = entry;
                void toBuffer(entry).then((data) => files.set(path, data));
            } else {
                entry.resume();
            }
        },
    });

    await pipeline(Readable.from(buffer), tarStream);

    if (!packageJsonPromise) {
        throw new Error("Could not find package.json in tarball");
    }

    const packageJsonBuffer = await packageJsonPromise;
    const packageJson = JSON.parse(
        packageJsonBuffer.toString("utf8"),
    ) as TemplatePackageJson;

    return { packageJson, files };
}
