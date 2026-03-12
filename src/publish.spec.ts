import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { afterAll, beforeAll, expect, inject, it, vi } from "vitest";
import { prepare } from "./prepare";
import { publish } from "./publish";
import { rmDir } from "./test-utils/rm-dir";
import { temporaryDirectory } from "./test-utils/temporary-directory";

/* Increased timeout time since test involves a lot reading and writing to disc. */
vi.setConfig({ testTimeout: 10000 });

const targetDir = temporaryDirectory();
const authEnv = inject("authEnv");
const npmrc = inject("npmrc");

async function writeNpmRc(dst: string): Promise<void> {
    const filePath = path.join(dst, ".npmrc");
    await fs.writeFile(filePath, npmrc);
}

beforeAll(async () => {
    await fs.mkdir(targetDir, { recursive: true });
});

afterAll(async () => {
    await rmDir(targetDir);
});

it("should publish template", async () => {
    expect.assertions(1);

    await writeNpmRc(targetDir);

    // Verify that the package is not already published before the test, to avoid false positives
    try {
        await spawn(
            "npm",
            [
                "unpublish",
                "@forsakringskassan/publish-template@1.0.0",
                "--force",
            ],
            {
                cwd: targetDir,
                env: authEnv,
            },
        );
    } catch {
        // ignore error if package is not found
    }

    const fixtureDir = path.resolve(import.meta.dirname, "../fixtures");
    const baseTemplate = path.join(fixtureDir, "publish-template");

    await prepare(baseTemplate, targetDir);
    await writeNpmRc(targetDir);
    await publish({ cwd: targetDir, env: authEnv });

    const result = await spawn(
        "npm",
        ["info", "@forsakringskassan/publish-template", "--json"],
        { env: authEnv },
    );
    const output = JSON.parse(result.output);
    expect(output).toEqual(
        expect.objectContaining({
            cloneman: {
                boilerplateFiles: ["boilerplate.txt", "managed.txt"],
                managedFiles: ["managed.txt"],
            },
            name: "@forsakringskassan/publish-template",
            version: "1.0.0",
            versions: ["1.0.0"],
        }),
    );
});
