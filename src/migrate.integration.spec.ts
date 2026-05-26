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

import { NoApplicationFolderError } from "./errors";
import { migrate } from "./migrate";

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
const baseTemplate = path.join(fixtureDir, "non-cloneman-application@1.0.0");
const userEnv = inject("userEnv");

let cwd: string;

async function readFile(filePath: string): Promise<string> {
    return fs.readFile(path.join(cwd, filePath), "utf8");
}

async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
    return JSON.parse(await readFile(filePath)) as T;
}

beforeEach(async () => {
    cwd = temporaryDirectory();
    await fs.cp(baseTemplate, cwd, { recursive: true });
});

afterEach(async () => {
    await rmDir(cwd);
});

describe("migrate to base template", () => {
    it("should migrate the project to the base template", async () => {
        expect.assertions(1);
        await migrate({
            templatePackage: "@forsakringskassan/base-template",
            cwd,
            env: userEnv,
        });

        expect(await readJsonFile("package.json")).toEqual({
            name: "non-cloneman-application",
            version: "1.0.0",
            private: true,
            description: "Used by migration tests",
            dependencies: {
                "@forsakringskassan/api-custom": "1.1.0",
            },
            devDependencies: {
                "@forsakringskassan/base-template": "1.0.2",
                "@forsakringskassan/lib-used by application": "1.0.0",
                cloneman: expect.any(String),
            },
            cloneman: {
                templatePackage: "@forsakringskassan/base-template",
                version: "N/A",
            },
        });
    });

    it("should throw error when no application folder is found", async () => {
        expect.assertions(1);
        await expect(
            migrate({
                templatePackage: "@forsakringskassan/base-template",
                cwd: temporaryDirectory(),
                env: userEnv,
            }),
        ).rejects.toThrow(NoApplicationFolderError);
    });
});
