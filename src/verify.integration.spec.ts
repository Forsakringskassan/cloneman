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
import {
    TemplateFileHashMismatchError,
    TemplateVersionMismatchError,
} from "./errors";
import { rmDir } from "./test-utils/rm-dir";
import { temporaryDirectory } from "./test-utils/temporary-directory";

import { type ApplicationPackageJson, writeJsonFile } from "./utils";
import { verify } from "./verify";

/* Increased timeout time since test involves a lot reading & writing to disc, and also fetching data from a local npm registry */
vi.setConfig({ testTimeout: 30_000 });

expect.addSnapshotSerializer({
    test() {
        return true;
    },
    serialize: String,
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

/* Simulate a user / Renovate updating the template dependency */
async function updateTemplateVersion(
    templatePackage: string,
    version: string,
): Promise<void> {
    const packageJson =
        await readJsonFile<ApplicationPackageJson>("package.json");
    packageJson.devDependencies ??= {};
    packageJson.devDependencies[templatePackage] = version;

    await writeJsonFile(path.join(appDir, "package.json"), packageJson, {
        indent: 2,
        trailer: "",
    });
}

beforeEach(() => {
    cwd = temporaryDirectory();
    appDir = path.join(cwd, "mock-app");
});

afterEach(async () => {
    await rmDir(cwd);
});

describe("verify", () => {
    beforeEach(async () => {
        /* create the initial application using template at version 1.0.0 */
        await create({
            name: "mock-app",
            templatePackage: "@forsakringskassan/base-template@1.0.0",
            cwd,
            env: userEnv,
            parameters: new Map(),
        });
    });

    it("should pass since version matches", async () => {
        expect.assertions(1);

        await expect(
            verify({
                applicationPath: appDir,
                managedFilesOnly: false,
                env: userEnv,
            }),
        ).resolves.toBeUndefined();
    });

    it("should fail since version mismatches", async () => {
        expect.assertions(1);

        await updateTemplateVersion(
            "@forsakringskassan/base-template",
            "1.0.1",
        );

        await expect(
            verify({
                applicationPath: appDir,
                managedFilesOnly: false,
                env: userEnv,
            }),
        ).rejects.toThrow(TemplateVersionMismatchError);
    });

    it("should fail since file hash is different between versions.", async () => {
        expect.assertions(1);

        await updateTemplateVersion(
            "@forsakringskassan/base-template",
            "1.0.1",
        );

        await expect(
            verify({
                applicationPath: appDir,
                managedFilesOnly: true,
                env: userEnv,
            }),
        ).rejects.toThrow(TemplateFileHashMismatchError);
    });
});
