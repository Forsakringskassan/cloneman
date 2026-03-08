import fs from "node:fs/promises";
import path from "node:path";
import { afterAll, afterEach, beforeAll, expect, inject, it } from "vitest";
import { create } from "./create";
import { pack } from "./pack";
import { prepare } from "./prepare";
import { temporaryDirectory } from "./test-utils/temporary-directory";
import { update } from "./update";

expect.addSnapshotSerializer({
    test() {
        return true;
    },
    serialize(value) {
        return String(value);
    },
});

const cwd = "temp/update-test";
const appDir = path.join(cwd, "mock-app");
const userEnv = inject("userEnv");

function readFile(filePath: string): Promise<string> {
    return fs.readFile(path.join(appDir, filePath), "utf8");
}

async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
    return JSON.parse(await readFile(filePath)) as T;
}

beforeAll(async () => {
    await fs.mkdir(cwd, { recursive: true });
});

afterEach(async () => {
    await fs.rm(appDir, { recursive: true, force: true });
});

afterAll(async () => {
    await fs.rm(cwd, { recursive: true, force: true });
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

    /* update the application using the local tarball */
    await update(appDir, tarballPath, userEnv);
    expect(await readJsonFile("package.json")).toEqual(
        expect.objectContaining({
            devDependencies: {
                "@forsakringskassan/base-template": expect.stringContaining(
                    tarballPath.replaceAll("\\", "/"),
                ),
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
    await expect(update(appDir, invalidTarPath, userEnv)).rejects.toThrowError(
        `Tarball not found at path`,
    );
});
