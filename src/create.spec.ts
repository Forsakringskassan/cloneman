import fs from "node:fs/promises";
import path from "node:path";
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    inject,
    it,
} from "vitest";
import { create } from "./create";
import { pack } from "./pack";
import { prepare } from "./prepare";
import { temporaryDirectory } from "./test-utils/temporary-directory";

expect.addSnapshotSerializer({
    test() {
        return true;
    },
    serialize(value) {
        return String(value);
    },
});

const fixtureDir = path.resolve(import.meta.dirname, "../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template@1.0.0");
const targetDir = temporaryDirectory();

const cwd = "temp/create-test";
const appDir = path.join(cwd, "mock-app");
const userEnv = inject("userEnv");

async function readFile(filePath: string): Promise<string> {
    return fs.readFile(path.join(appDir, filePath), "utf8");
}

async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
    return JSON.parse(await readFile(filePath)) as T;
}

describe("create from base template from npm registry", () => {
    beforeAll(async () => {
        await fs.mkdir(cwd, { recursive: true });
    });

    afterEach(async () => {
        await fs.rm(appDir, { recursive: true, force: true });
    });

    afterAll(async () => {
        await fs.rm(cwd, { recursive: true, force: true });
    });

    it("should create new project", async () => {
        expect.assertions(3);
        await create({
            name: "mock-app",
            templatePackage: "@forsakringskassan/base-template@1.0.0",
            cwd,
            env: userEnv,
        });
        expect(await readJsonFile("package.json")).toEqual({
            name: "mock-app",
            version: "0.0.0",
            private: true,
            description: "",
            files: [],
            dependencies: {},
            devDependencies: {
                "@forsakringskassan/base-template": "1.0.0",
            },
            cloneman: "@forsakringskassan/base-template",
        });
        expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
            `boilerplate file at v1.0.0`,
        );
        expect(await readFile("managed.txt")).toMatchInlineSnapshot(
            `managed file at v1.0.0`,
        );
    });

    it("should throw error if directory already exists", async () => {
        expect.hasAssertions();
        await fs.mkdir(appDir, { recursive: true });
        await expect(
            create({
                name: "mock-app",
                templatePackage: "@forsakringskassan/base-template@1.0.0",
                cwd,
            }),
        ).rejects.toThrowError("application dir already exists");
    });

    it("should throw error if package do not exist", async () => {
        expect.hasAssertions();
        await expect(
            create({
                name: "mock-app",
                templatePackage: "@forsakringskassan/non-existing-package",
                cwd,
                env: userEnv,
            }),
        ).rejects.toThrowError(
            `Failed to install template package: Command failed with exit code 1: npm install --save-dev --save-exact '@forsakringskassan/non-existing-package'`,
        );
    });

    it("should throw error if package is not a template", async () => {
        expect.hasAssertions();
        // non-template-package is already published by vitest.setup.ts
        await expect(
            create({
                name: "mock-app",
                templatePackage: "@forsakringskassan/non-template-package",
                cwd,
                env: userEnv,
            }),
        ).rejects.toThrowError(
            `Package @forsakringskassan/non-template-package is not a valid cloneman template package`,
        );
    });
});

describe("create from local template package", () => {
    afterEach(async () => {
        await fs.rm(appDir, { recursive: true, force: true });
    });

    afterAll(async () => {
        await fs.rm(cwd, { recursive: true, force: true });
    });

    it("should create new project from local .tgz file", async () => {
        expect.assertions(3);

        /* create a local tarball for version 1.0.0 */
        const tarballPath = path.join(
            targetDir,
            "forsakringskassan-base-template-1.0.0.tgz",
        );
        await prepare(baseTemplate, targetDir);
        await pack({ cwd: targetDir, targetDir });
        await fs.mkdir(cwd, { recursive: true });

        /* create the application using the local tarball */
        await create({
            name: "mock-app",
            templatePackage: tarballPath,
            cwd,
            env: {},
        });
        expect(await readJsonFile("package.json")).toEqual({
            name: "mock-app",
            version: "0.0.0",
            private: true,
            description: "",
            files: [],
            dependencies: {},
            devDependencies: {
                "@forsakringskassan/base-template": expect.stringContaining(
                    tarballPath.replaceAll("\\", "/"),
                ),
            },
            cloneman: "@forsakringskassan/base-template",
        });
        expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
            `boilerplate file at v1.0.0`,
        );
        expect(await readFile("managed.txt")).toMatchInlineSnapshot(
            `managed file at v1.0.0`,
        );
    });
});
