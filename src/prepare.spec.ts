import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prepare } from "./prepare";
import { rmDir } from "./test-utils/rm-dir";
import { temporaryDirectory } from "./test-utils/temporary-directory";
import { readJsonFile } from "./utils";
import { type PackageJson } from "./utils/package-json";

const fixtureDir = path.resolve(import.meta.dirname, "../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template@1.0.0");
const baseTemplateUpdated = path.join(fixtureDir, "base-template@1.0.1");

let targetDir: string;

beforeEach(() => {
    targetDir = temporaryDirectory();
});

afterEach(async () => {
    await rmDir(targetDir);
});

describe("prepare base template", () => {
    beforeEach(async () => {
        await prepare(baseTemplate, targetDir);
    });

    it("prepare", async () => {
        expect.hasAssertions();
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
                path.join("files", "sub-folder", "sub-file.txt"),
            ]),
        );
        expect(files).toHaveLength(6);
    });

    it("should create a massaged template package.json", async () => {
        expect.hasAssertions();
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
        expect.hasAssertions();
        const packageJson = await readJsonFile<PackageJson>(
            path.join(targetDir, "package.json"),
        );

        expect(packageJson).toMatchInlineSnapshot(`
          {
            "cloneman": {
              "boilerplateFiles": [
                ".gitignore",
                "boilerplate.txt",
                "managed.txt",
                "sub-folder/sub-file.txt",
              ],
              "managedFiles": [
                "managed.txt",
                ".gitignore",
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
});

describe("prepare base template 1.0.1", () => {
    it("should not contain ignored packages", async () => {
        expect.hasAssertions();

        await prepare(baseTemplateUpdated, targetDir);
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

        await expect(prepare(cwd, targetDir)).rejects.toThrowError(
            `Current directory is not a valid cloneman template (missing ".cloneman")`,
        );
    });
});
