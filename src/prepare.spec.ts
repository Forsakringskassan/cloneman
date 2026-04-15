import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prepare } from "./prepare";
import { rmDir, temporaryDirectory, withFixture } from "./test-utils";
import { readJsonFile } from "./utils";
import { type PackageJson } from "./utils/package-json";

const fixtureDir = path.resolve(import.meta.dirname, "../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template@1.0.0");
const baseTemplateUpdated = path.join(fixtureDir, "base-template@1.0.1");

let targetDir: string;

/* Increased timeout time since test involves a lot reading and writing to disc. */
vi.setConfig({ testTimeout: 10000 });

beforeEach(() => {
    targetDir = temporaryDirectory();
});

afterEach(async () => {
    await rmDir(targetDir);
});

describe("prepare base template", () => {
    it("prepare", async () => {
        expect.assertions(3);

        const { output } = await prepare(baseTemplate, targetDir);
        expect(output).toMatchInlineSnapshot(`
          "Assembling cloneman template "@forsakringskassan/base-template@1.0.0"
            6 files copied (4 ignored)"
        `);

        const testPath = path.join(targetDir, "files/**/*");
        const files = await Array.fromAsync(fs.glob(testPath, {}), (file) => {
            return path.relative(targetDir, file);
        });

        expect(files).toEqual(
            expect.arrayContaining([
                path.join("files", "_gitignore"),
                path.join("files", "boilerplate.txt"),
                path.join("files", "managed.txt"),
                path.join("files", "package.json"),
                path.join("files", "sub-folder"),
                path.join("files", "renovate.json"),
                path.join("files", "sub-folder", "sub-file.txt"),
                path.join("files", "_npmrc"),
            ]),
        );
        expect(files).toHaveLength(8);
    });

    it("should create a massaged template package.json", async () => {
        expect.assertions(2);

        const { output } = await prepare(baseTemplate, targetDir);
        expect(output).toMatchInlineSnapshot(`
          "Assembling cloneman template "@forsakringskassan/base-template@1.0.0"
            6 files copied (4 ignored)"
        `);

        const packageJson = await readJsonFile<PackageJson>(
            path.join(targetDir, "files", "package.json"),
        );

        expect(packageJson).toMatchInlineSnapshot(`
          {
            "cloneman": "@forsakringskassan/base-template",
            "dependencies": {},
            "description": "\${description}",
            "devDependencies": {
              "@forsakringskassan/base-template": "1.0.0",
              "@forsakringskassan/lib-used-by-templates": "1.0.0",
            },
            "files": [],
            "name": "\${name}",
            "private": true,
            "version": "\${version}",
          }
        `);
    });

    it("should create a new package.json for NPM package", async () => {
        expect.assertions(2);

        const { output } = await prepare(baseTemplate, targetDir);
        expect(output).toMatchInlineSnapshot(`
          "Assembling cloneman template "@forsakringskassan/base-template@1.0.0"
            6 files copied (4 ignored)"
        `);

        const packageJson = await readJsonFile<PackageJson>(
            path.join(targetDir, "package.json"),
        );

        expect(packageJson).toMatchInlineSnapshot(`
          {
            "cloneman": {
              "boilerplateFiles": [
                ".gitignore",
                ".npmrc",
                "boilerplate.txt",
                "managed.txt",
                "renovate.json",
                "sub-folder/sub-file.txt",
              ],
              "managedFiles": [
                "managed.txt",
                ".gitignore",
                "renovate.json",
              ],
            },
            "exports": {
              ".": "./index.js",
            },
            "name": "@forsakringskassan/base-template",
            "type": "module",
            "version": "1.0.0",
          }
        `);
    });

    it("should add packageRules to managed renovate.json", async () => {
        expect.assertions(2);

        const { output } = await prepare(baseTemplate, targetDir);
        expect(output).toMatchInlineSnapshot(`
          "Assembling cloneman template "@forsakringskassan/base-template@1.0.0"
            6 files copied (4 ignored)"
        `);

        const renovateJson = await readJsonFile(
            path.join(targetDir, "files", "renovate.json"),
        );

        expect(renovateJson).toMatchInlineSnapshot(`
          {
            "extends": [
              "local>forsakringskassan/renovate-config",
            ],
            "ignoreDeps": [
              "@forsakringskassan/lib-used-by-templates",
            ],
          }
        `);
    });
});

describe("prepare base template 1.0.1", () => {
    it("should not contain ignored packages", async () => {
        expect.assertions(2);

        const { output } = await prepare(baseTemplateUpdated, targetDir);
        expect(output).toMatchInlineSnapshot(`
          "Assembling cloneman template "@forsakringskassan/base-template@1.0.1"
            2 files copied (3 ignored)"
        `);

        const packageJson = await readJsonFile<PackageJson>(
            path.join(targetDir, "files", "package.json"),
        );

        expect(packageJson).toMatchInlineSnapshot(`
          {
            "cloneman": "@forsakringskassan/base-template",
            "dependencies": {},
            "description": "\${description}",
            "devDependencies": {
              "@forsakringskassan/base-template": "1.0.1",
            },
            "files": [],
            "name": "\${name}",
            "private": true,
            "version": "\${version}",
          }
        `);
    });
});

describe("prepare non-template package", () => {
    it("should throw error if package is not a template", async () => {
        expect.hasAssertions();
        const cwd = path.join(fixtureDir, "non-template-package");

        await expect(prepare(cwd, targetDir)).rejects.toThrow(
            `Current directory is not a valid cloneman template (missing ".cloneman")`,
        );
    });
});

describe("prepare template-missing-build", () => {
    it("should throw error if build file is missing", async () => {
        expect.hasAssertions();
        const cwd = path.join(fixtureDir, "template-missing-build");

        await expect(prepare(cwd, targetDir)).rejects.toThrow(
            `No build file found in ".cloneman". Tried: build.{js,mjs,ts,mts}`,
        );
    });
});

describe("protected files", () => {
    it("should copy protected files from git history", async () => {
        expect.assertions(2);
        await withFixture("base-template@1.0.0", async (fixture) => {
            /* edit non-protected file */
            await fs.appendFile(
                path.join(fixture, "boilerplate.txt"),
                "\nThis line should be in the prepared template",
            );

            /* edit protected file */
            await fs.appendFile(
                path.join(fixture, ".npmrc"),
                "\nregistry=https://registry.npmjs.org/",
            );

            await prepare(fixture, targetDir);

            const npmrc = await fs.readFile(
                path.join(targetDir, "files", "_npmrc"),
                "utf8",
            );

            const boilerplate = await fs.readFile(
                path.join(targetDir, "files", "boilerplate.txt"),
                "utf8",
            );

            expect(boilerplate).toContain(
                "This line should be in the prepared template",
            );

            expect(npmrc).not.toContain("registry=https://registry.npmjs.org/");
        });
    });
});

describe("updateJson()", () => {
    it("should update json files before publish", async () => {
        expect.assertions(1);
        await withFixture("update-json-template", async (fixture) => {
            await prepare(fixture, targetDir);
            const filePath = path.join(targetDir, "files", "foo.json");
            const json = await readJsonFile(filePath);
            expect(json).toEqual({
                foo: "this value should be kept",
                bar: "overwritten value",
                nested: {
                    spam: "ham",
                },
            });
        });
    });
});
