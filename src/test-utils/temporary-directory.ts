import { randomBytes } from "node:crypto";
import { mkdirSync, realpathSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const tempdir = realpathSync(os.tmpdir());

/**
 * @internal
 */
export function temporaryDirectory(): string {
    const testPath = path.join(tempdir, randomBytes(16).toString("hex"));
    mkdirSync(testPath);
    return testPath;
}

/**
 * Run callback with a temporary directory. The directory is automatically
 * cleaned up after the callback is finished.
 *
 * @internal
 */
export async function withTemporaryDirectory(
    cb: (dir: string) => void | Promise<void>,
): Promise<void> {
    const dir = path.join(tempdir, randomBytes(16).toString("hex"));
    await fs.mkdir(dir);
    try {
        await cb(dir);
    } finally {
        await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
    }
}
