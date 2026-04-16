import fs from "node:fs/promises";
import path from "node:path";
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    inject,
    it,
    vi,
} from "vitest";

import { create } from "./create";
import { pack } from "./pack";
import { prepare } from "./prepare";
import { rmDir } from "./test-utils/rm-dir";
import { temporaryDirectory } from "./test-utils/temporary-directory";

/* Increased timeout time since test involves a lot reading & writing to disc, and also fetching data from a local npm registry */
vi.setConfig({ testTimeout: 30000 });

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
const userEnv = inject("userEnv");

let cwd: string;
let appDir: string;

async function readFile(filePath: string): Promise<string> {
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

describe("create from base template from npm registry", () => {
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
                "@forsakringskassan/lib-used-by-templates": "1.0.0",
            },
            cloneman: {
                template: "@forsakringskassan/base-template",
                version: "1.0.0",
            },
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
        ).rejects.toThrow("application dir already exists");
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
        ).rejects.toThrow(
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
        ).rejects.toThrow(
            `Package @forsakringskassan/non-template-package is not a valid cloneman template package`,
        );
    });
});

describe("create from local template package", () => {
    it("should create new project from local .tgz file", async () => {
        expect.assertions(3);

        /* create a local tarball for version 1.0.0 */
        const tarballPath = path.join(
            targetDir,
            "forsakringskassan-base-template-1.0.0.tgz",
        );
        const relativeTarballPath = path.relative(appDir, tarballPath);

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
                    relativeTarballPath.replaceAll("\\", "/"),
                ),
                "@forsakringskassan/lib-used-by-templates": "1.0.0",
            },
            cloneman: {
                template: "@forsakringskassan/base-template",
                version: "1.0.0",
            },
        });
        expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
            `boilerplate file at v1.0.0`,
        );
        expect(await readFile("managed.txt")).toMatchInlineSnapshot(
            `managed file at v1.0.0`,
        );
    });
});
