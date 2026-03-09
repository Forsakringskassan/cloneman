import fs from "node:fs/promises";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { prepare } from "./prepare";
import { readJsonFile } from "./utils";
import { type PackageJson } from "./utils/package-json";

const fixtureDir = path.resolve(import.meta.dirname, "../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template@1.0.0");
const targetDir = path.resolve("temp/prepare-test");

describe("prepare base template", () => {
    beforeAll(async () => {
        const cwd = baseTemplate;
        await prepare(cwd, targetDir);
    });

    it("prepare", async () => {
        expect.hasAssertions();
        const testPath = path.join(targetDir, "files/**.*");
        const files = await Array.fromAsync(fs.glob(testPath, {}), (file) => {
            return path.relative(targetDir, file);
        });

        expect(files).toEqual([
            path.join("files", "boilerplate.txt"),
            path.join("files", "managed.txt"),
            path.join("files", "package.json"),
        ]);
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
                "boilerplate.txt",
                "managed.txt",
              ],
              "managedFiles": [
                "managed.txt",
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

describe("prepare non-template package", () => {
    it("should throw error if package is not a template", async () => {
        expect.hasAssertions();
        const cwd = path.join(fixtureDir, "non-template-package");

        await expect(prepare(cwd, targetDir)).rejects.toThrowError(
            `Current directory is not a valid cloneman template (missing ".cloneman")`,
        );
    });
});
