import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";
import { create } from "./create";
import { pack } from "./pack";
import { prepare } from "./prepare";
import { publish } from "./publish";
import {
    authEnv,
    getRegistryUrl,
    start,
    stop,
    writeNpmRc,
} from "./test-utils/npm-registry";
import { temporaryDirectory } from "./test-utils/temporary-directory";
import { update } from "./update";
import { type PackageJson } from "./utils/package-json";
import { readJsonFile } from "./utils/read-json-file";

const fixtureDir = path.resolve(import.meta.dirname, "../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template");
const baseTemplateUpdated = path.join(fixtureDir, "base-template-updated");

const targetDir = temporaryDirectory();

const cwd = "temp/update-test";
const appDir = path.join(cwd, "mock-app");

const templatePackage = "@forsakringskassan/base-template@1.0.0";

let createEnv: Record<string, string>;

describe("update from npm registry", () => {
    beforeAll(async () => {
        await prepare(baseTemplate, targetDir);

        const authToken = await start(targetDir);
        await publish({ cwd: targetDir, env: authEnv });

        await prepare(baseTemplateUpdated, targetDir);
        await writeNpmRc(authToken, targetDir);

        await publish({ cwd: targetDir, env: authEnv });
        await pack({ cwd: targetDir, targetDir });

        await fs.mkdir(cwd, { recursive: true });

        createEnv = {
            /* eslint-disable-next-line camelcase -- outside our control */
            npm_config_registry: getRegistryUrl(),
        };
    });

    beforeEach(async () => {
        await create({
            name: "mock-app",
            templatePackage,
            cwd,
            env: createEnv,
        });
    });

    afterEach(async () => {
        await fs.rm(appDir, { recursive: true, force: true });
    });

    afterAll(async () => {
        await fs.rm(cwd, { recursive: true, force: true });
        await stop();
    });

    it("should update existing project", async () => {
        expect.hasAssertions();

        expect(existsSync(appDir)).toBeTruthy();

        let managedFile = await fs.readFile(
            path.join(appDir, "managed.txt"),
            "utf8",
        );

        expect(managedFile).toBe("Updated file from Base-template");

        await update(appDir, "1.0.1", createEnv);

        const boilerplateFile = await fs.readFile(
            path.join(appDir, "boilerplate.txt"),
            "utf8",
        );

        expect(boilerplateFile).toBe(
            "Boilerplate file copied in create command",
        );

        managedFile = await fs.readFile(
            path.join(appDir, "managed.txt"),
            "utf8",
        );

        expect(managedFile).toContain(
            "Updated file from Base-template - 1.0.1",
        );
    });

    it("should update existing project from local tar", async () => {
        expect.hasAssertions();

        expect(existsSync(appDir)).toBeTruthy();

        const templatePackage = path.join(
            targetDir,
            "forsakringskassan-base-template-1.0.1.tgz",
        );

        await update(appDir, templatePackage, createEnv);

        const managedFile = await fs.readFile(
            path.join(appDir, "managed.txt"),
            "utf8",
        );

        const packageJson = await readJsonFile<PackageJson>(
            path.join(appDir, "package.json"),
        );

        expect(
            packageJson.devDependencies?.["@forsakringskassan/base-template"],
        ).toContain("forsakringskassan-base-template-1.0.1.tgz");

        expect(managedFile).toContain(
            "Updated file from Base-template - 1.0.1",
        );
    });

    it("should crash if invalid tar path", async () => {
        expect.hasAssertions();

        const templatePackage = path.join(
            targetDir,
            "forsakringskassan-base-template-4.0.4.tgz",
        );

        await expect(
            update(appDir, templatePackage, createEnv),
        ).rejects.toThrowError(`Tarball not found at path`);
    });
});
