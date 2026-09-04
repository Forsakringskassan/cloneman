import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Write template tarball files to a temporary directory and run a callback
 * with that directory. The directory is automatically cleaned up after the
 * callback is finished.
 *
 * @internal
 */
export async function withTemporaryTarBallDirectory(
    cb: (dir: string, index: string) => void | Promise<void>,
    options: {
        files: Map<string, Buffer>;
    },
): Promise<void> {
    const tempdir = await fs.realpath(os.tmpdir());
    const dir = path.join(tempdir, randomBytes(16).toString("hex"));
    await fs.mkdir(dir);

    try {
        await Promise.all(
            Array.from(options.files, async ([filename, content]) => {
                const relativeFilename = filename.slice("package/".length);
                const dest = path.join(dir, relativeFilename);
                await fs.mkdir(path.dirname(dest), { recursive: true });
                await fs.writeFile(dest, content);
            }),
        );
        await cb(dir, pathToFileURL(path.join(dir, "index.js")).href);
    } finally {
        await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
    }
}
