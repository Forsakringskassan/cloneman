import { randomBytes } from "node:crypto";
import { mkdirSync, realpathSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const tempdir = realpathSync(os.tmpdir());

export function temporaryDirectory(): string {
    const testPath = path.join(tempdir, randomBytes(16).toString("hex"));
    mkdirSync(testPath);
    return testPath;
}
