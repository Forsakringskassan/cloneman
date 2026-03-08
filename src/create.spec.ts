import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { create } from "./create";
import { pack } from "./pack";
import { prepare } from "./prepare";
import { publish } from "./publish";
import {
    authEnv,
    getRegistryUrl,
    start,
    stop,
} from "./test-utils/npm-registry";
import { temporaryDirectory } from "./test-utils/temporary-directory";
import { readJsonFile } from "./utils";
import { type PackageJson } from "./utils/package-json";

const fixtureDir = path.resolve(import.meta.dirname, "../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template@1.0.0");
const targetDir = temporaryDirectory();

const cwd = "temp/create-test";
const appDir = path.join(cwd, "mock-app");

const templatePackage = "@forsakringskassan/base-template";
const nonTemplatePackage = path.join(fixtureDir, "non-template-package");

let createEnv: Record<string, string>;

async function readFile(appDir: string, filePath: string): Promise<string> {
    return fs.readFile(path.join(appDir, filePath), "utf8");
}

describe("create from base template from npm registry", () => {
    beforeAll(async () => {
        await prepare(baseTemplate, targetDir);
        await start(targetDir);
        await publish({ cwd: targetDir, env: authEnv });
        await fs.mkdir(cwd, { recursive: true });

        createEnv = {
            /* eslint-disable-next-line camelcase -- outside our control */
            npm_config_registry: getRegistryUrl(),
        };
    });

    afterEach(async () => {
        await fs.rm(appDir, { recursive: true, force: true });
    });

    afterAll(async () => {
        await fs.rm(cwd, { recursive: true, force: true });
        await stop();
    });

    it("should create new project", async () => {
        expect.hasAssertions();
        await create({
            name: "mock-app",
            templatePackage,
            cwd,
            env: createEnv,
        });
        expect(existsSync(appDir)).toBeTruthy();

        expect(await readFile(appDir, "package.json")).toMatchInlineSnapshot(
            `
          "{
            "name": "mock-app",
            "version": "0.0.0",
            "private": true,
            "description": "",
            "files": [],
            "dependencies": {},
            "devDependencies": {
              "@forsakringskassan/base-template": "1.0.0"
            },
            "cloneman": "@forsakringskassan/base-template"
          }"
        `,
        );
        expect(await readFile(appDir, "boilerplate.txt")).toMatchInlineSnapshot(
            `"Boilerplate file copied in create command"`,
        );
        expect(await readFile(appDir, "managed.txt")).toMatchInlineSnapshot(
            `"Updated file from Base-template"`,
        );
    });

    it("should throw error if directory already exists", async () => {
        expect.hasAssertions();
        await fs.mkdir(appDir, { recursive: true });
        await expect(
            create({
                name: "mock-app",
                templatePackage,
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
                env: createEnv,
            }),
        ).rejects.toThrowError(
            `Failed to install template package: Command failed with exit code 1: npm install --save-dev --save-exact '@forsakringskassan/non-existing-package'`,
        );
    });

    it("should throw error if package is not a template", async () => {
        expect.hasAssertions();
        // Create and publish a package that does not have the "cloneman" field in its package.json */
        await fs.cp(
            nonTemplatePackage,
            path.join(targetDir, "non-template-package"),
            {
                recursive: true,
            },
        );

        await fs.copyFile(
            path.join(targetDir, ".npmrc"),
            path.join(targetDir, "non-template-package", ".npmrc"),
        );

        await publish({
            cwd: path.join(targetDir, "non-template-package"),
            env: authEnv,
        });

        await expect(
            create({
                name: "mock-app",
                templatePackage: "@forsakringskassan/non-template-package",
                cwd,
                env: createEnv,
            }),
        ).rejects.toThrowError(
            `Package @forsakringskassan/non-template-package is not a valid cloneman template package`,
        );
    });
});

describe("create from local template package", () => {
    beforeAll(async () => {
        await prepare(baseTemplate, targetDir);
        await pack({ cwd: targetDir, targetDir });
        await fs.mkdir(cwd, { recursive: true });
    });

    afterEach(async () => {
        await fs.rm(appDir, { recursive: true, force: true });
    });

    afterAll(async () => {
        await fs.rm(cwd, { recursive: true, force: true });
    });

    it("should create new project from local .tgz file", async () => {
        expect.hasAssertions();

        await create({
            name: "mock-app",
            templatePackage: path.join(
                targetDir,
                "forsakringskassan-base-template-1.0.0.tgz",
            ),
            cwd,
            env: {},
        });

        const json = await readJsonFile<PackageJson>(
            path.join(appDir, "package.json"),
        );

        expect(json.name).toBe("mock-app");
        expect(json.devDependencies).toHaveProperty(
            "@forsakringskassan/base-template",
        );

        expect(
            json.devDependencies!["@forsakringskassan/base-template"],
        ).toContain("file:");
    });
});
