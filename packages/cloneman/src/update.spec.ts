import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, expect, inject, it, vi } from "vitest";
import { create } from "./create";
import { pack } from "./pack";
import { prepare } from "./prepare";
import { rmDir } from "./test-utils/rm-dir";
import { temporaryDirectory } from "./test-utils/temporary-directory";
import { update } from "./update";

/* Increased timeout time since test involves a lot reading and writing to disc. */
vi.setConfig({ testTimeout: 10000 });

expect.addSnapshotSerializer({
    test() {
        return true;
    },
    serialize(value) {
        return String(value);
    },
});

let cwd: string;
let appDir: string;

const userEnv = inject("userEnv");

function readFile(filePath: string): Promise<string> {
    return fs.readFile(path.join(appDir, filePath), "utf8");
}

async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
    return JSON.parse(await readFile(filePath)) as T;
}

beforeEach(() => {
    cwd = temporaryDirectory();
    appDir = path.join(cwd, "mock-app");
});

afterEach(async () => {
    await rmDir(cwd);
});

it("should update existing project", async () => {
    expect.assertions(5);

    /* create the initial application using template at version 1.0.0 */
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/base-template@1.0.0",
        cwd,
        env: userEnv,
    });
    expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
        `boilerplate file at v1.0.0`,
    );
    expect(await readFile("managed.txt")).toMatchInlineSnapshot(
        `managed file at v1.0.0`,
    );

    /* update the application to version 1.0.1 */
    await update(appDir, "1.0.1", userEnv);
    expect(await readJsonFile("package.json")).toEqual(
        expect.objectContaining({
            devDependencies: {
                "@forsakringskassan/base-template": "1.0.1",
                "@forsakringskassan/lib-used-by-templates": "1.0.0",
            },
        }),
    );
    expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
        `boilerplate file at v1.0.0`,
    );
    expect(await readFile("managed.txt")).toMatchInlineSnapshot(
        `managed file at v1.0.1`,
    );
});

it("should update existing project from local tar", async () => {
    expect.assertions(5);

    /* create the initial application using template at version 1.0.0 */
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/base-template@1.0.0",
        cwd,
        env: userEnv,
    });
    expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
        `boilerplate file at v1.0.0`,
    );
    expect(await readFile("managed.txt")).toMatchInlineSnapshot(
        `managed file at v1.0.0`,
    );

    /* create a local tarball for version 1.0.1 */
    const fixturePath = path.resolve(
        import.meta.dirname,
        "../fixtures",
        "base-template@1.0.1",
    );
    const targetDir = temporaryDirectory();
    await prepare(fixturePath, targetDir);
    await pack({ cwd: targetDir, targetDir });
    const tarballPath = path.join(
        targetDir,
        "forsakringskassan-base-template-1.0.1.tgz",
    );
    const relativeTarballPath = path.relative(appDir, tarballPath);

    /* update the application using the local tarball */
    await update(appDir, tarballPath, userEnv);
    expect(await readJsonFile("package.json")).toEqual(
        expect.objectContaining({
            devDependencies: {
                "@forsakringskassan/base-template": expect.stringContaining(
                    relativeTarballPath.replaceAll("\\", "/"),
                ),
                "@forsakringskassan/lib-used-by-templates": "1.0.0",
            },
        }),
    );
    expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
        `boilerplate file at v1.0.0`,
    );
    expect(await readFile("managed.txt")).toMatchInlineSnapshot(
        `managed file at v1.0.1`,
    );
});

it("should crash if invalid tar path", async () => {
    expect.assertions(1);

    /* create the initial application using template at version 1.0.0 */
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/base-template@1.0.0",
        cwd,
        env: userEnv,
    });

    /* try to update to a non-existing tarball */
    const invalidTarPath = path.join(appDir, "base-template-4.0.4.tgz");
    await expect(update(appDir, invalidTarPath, userEnv)).rejects.toThrow(
        `Tarball not found at path`,
    );
});
