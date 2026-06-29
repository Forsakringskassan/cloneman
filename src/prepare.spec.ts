import fs, { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prepare } from "./prepare";
import {
    printTree,
    rmDir,
    temporaryDirectory,
    withFixture,
} from "./test-utils";
import {
    type PackageJson,
    type TemplatePackageJson,
    readJsonFile,
} from "./utils";

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
        expect.assertions(2);

        const { output } = await prepare(baseTemplate, targetDir);
        expect(output).toMatchInlineSnapshot(`
          "Assembling cloneman template "@forsakringskassan/base-template@1.0.0"
            6 files copied (3 ignored)
          "
        `);

        expect(await printTree(targetDir)).toMatchInlineSnapshot(`
          "(root)
              ├── files
              │   ├── _gitignore
              │   ├── _npmrc
              │   ├── boilerplate.txt
              │   ├── managed.txt
              │   ├── package.json
              │   ├── renovate.json
              │   └── sub-folder
              │       └── sub-file.txt
              ├── index.js
              └── package.json"
        `);
    });

    it("should create a massaged template package.json", async () => {
        expect.assertions(2);

        const { output } = await prepare(baseTemplate, targetDir);
        expect(output).toMatchInlineSnapshot(`
          "Assembling cloneman template "@forsakringskassan/base-template@1.0.0"
            6 files copied (3 ignored)
          "
        `);

        const packageJson = await readJsonFile<PackageJson>(
            path.join(targetDir, "files", "package.json"),
        );

        expect(packageJson).toMatchInlineSnapshot(`
          {
            "author": "Author Name <author.name@example.net>",
            "bugs": {
              "url": "https://example.net/base-template/bugs",
            },
            "cloneman": {
              "template": "@forsakringskassan/base-template",
              "version": "1.0.0",
            },
            "dependencies": {
              "@forsakringskassan/api-lib-a": "1.0.0",
              "@forsakringskassan/api-lib-b": "1.0.0",
            },
            "description": "\${description}",
            "devDependencies": {
              "@forsakringskassan/base-template": "1.0.0",
              "@forsakringskassan/lib-used-by-templates": "1.0.0",
              "cloneman": ".",
            },
            "files": [],
            "homepage": "https://example.net/base-template",
            "keywords": [
              "foo",
              "bar",
            ],
            "license": "MIT",
            "name": "\${name}",
            "private": true,
            "repository": {
              "type": "git",
              "url": "git+https://git.example.net/base-template",
            },
            "scripts": {
              "a": "foo",
            },
            "version": "\${version}",
          }
        `);
    });

    it("should create a new package.json for NPM package", async () => {
        expect.assertions(14);

        const { output } = await prepare(baseTemplate, targetDir);
        expect(output).toMatchInlineSnapshot(`
          "Assembling cloneman template "@forsakringskassan/base-template@1.0.0"
            6 files copied (3 ignored)
          "
        `);

        const packageJson = await readJsonFile<PackageJson>(
            path.join(targetDir, "package.json"),
        );

        const {
            name,
            version,
            description,
            keywords,
            homepage,
            bugs,
            repository,
            license,
            author,
            type,
            exports,
            cloneman,
            ...remainder
        } = packageJson;

        /* these fields should be copied verbatim from template repository
         * package.json (see `fixtures/base-template@1.0.0/package.json`) */
        expect(name).toBe("@forsakringskassan/base-template");
        expect(version).toBe("1.0.0");
        expect(description).toBe("base template description");
        expect(keywords).toEqual(["foo", "bar"]);
        expect(homepage).toBe("https://example.net/base-template");
        expect(bugs).toEqual({
            url: "https://example.net/base-template/bugs",
        });
        expect(repository).toEqual({
            type: "git",
            url: "git+https://git.example.net/base-template",
        });
        expect(license).toBe("MIT");
        expect(author).toBe("Author Name <author.name@example.net>");

        /* generated fields */
        expect(type).toBe("module");
        expect(exports).toEqual({
            ".": "./index.js",
        });

        /* cloneman data */
        expect(cloneman).toMatchInlineSnapshot(`
          {
            "boilerplateFiles": [
              ".gitignore",
              ".npmrc",
              "boilerplate.txt",
              "managed.txt",
              "renovate.json",
              "sub-folder/sub-file.txt",
            ],
            "ignoredDependencies": [],
            "managedFiles": [
              "managed.txt",
              ".gitignore",
              "renovate.json",
            ],
            "removeFiles": [],
            "uninstallDependencies": [],
          }
        `);

        /* sanity check: should be no keys left */
        expect(remainder).toEqual({});
    });

    it("should add packageRules to managed renovate.json", async () => {
        expect.assertions(2);

        const { output } = await prepare(baseTemplate, targetDir);
        expect(output).toMatchInlineSnapshot(`
          "Assembling cloneman template "@forsakringskassan/base-template@1.0.0"
            6 files copied (3 ignored)
          "
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
              "@forsakringskassan/api-lib-a",
              "@forsakringskassan/api-lib-b",
              "@forsakringskassan/lib-used-by-templates",
              "cloneman",
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
            2 files copied (2 ignored)
          "
        `);

        const packageJson = await readJsonFile<PackageJson>(
            path.join(targetDir, "files", "package.json"),
        );

        expect(packageJson).toMatchInlineSnapshot(`
          {
            "cloneman": {
              "template": "@forsakringskassan/base-template",
              "version": "1.0.1",
            },
            "dependencies": {
              "@forsakringskassan/api-lib-a": "1.1.0",
              "@forsakringskassan/api-lib-b": "1.1.0",
            },
            "description": "\${description}",
            "devDependencies": {
              "@forsakringskassan/base-template": "1.0.1",
              "@forsakringskassan/lib-used-by-templates": "1.0.0",
              "cloneman": ".",
            },
            "files": [],
            "name": "\${name}",
            "private": true,
            "scripts": {
              "a": "foo",
              "b": "bar",
            },
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
            /"[^"]*" is not a valid cloneman template \(missing ".cloneman"\)/,
        );
    });
});

describe("prepare template-missing-build", () => {
    it("should throw error if build file is missing", async () => {
        expect.hasAssertions();
        const cwd = path.join(fixtureDir, "template-missing-build");

        await expect(prepare(cwd, targetDir)).rejects.toThrow(
            /No "build" hook found in "[^"]+"/,
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

describe("writeFile()", () => {
    it("should write files to the template's file directory", async () => {
        expect.assertions(2);
        await withFixture("write-file-template", async (fixture) => {
            await prepare(fixture, targetDir);
            const ovewrittenFile = await readFile(
                path.join(targetDir, "files", "foo.txt"),
                "utf8",
            );
            expect(ovewrittenFile).toBe("Overwritten file");

            const newFile = await readFile(
                path.join(targetDir, "files", "new-file.txt"),
                "utf8",
            );
            expect(newFile).toBe("new file");
        });
    });
});

describe("build script", () => {
    it("should handle build script with default export", async () => {
        expect.assertions(1);
        await withFixture("with-default-build-script", async (fixture) => {
            await prepare(fixture, targetDir);
            const filePath = path.join(targetDir, "files", "foo.txt");
            const content = await fs.readFile(filePath, "utf8");
            expect(content).toBe("generated file");
        });
    });

    it("should handle build script with named export", async () => {
        expect.assertions(1);
        await withFixture("with-named-build-script", async (fixture) => {
            await prepare(fixture, targetDir);
            const filePath = path.join(targetDir, "files", "foo.txt");
            const content = await fs.readFile(filePath, "utf8");
            expect(content).toBe("generated file");
        });
    });
});

describe("hooks", () => {
    it("should store install hook in template package", async () => {
        expect.assertions(2);
        const template = path.join(fixtureDir, "with-install-hook@1.0.0");
        await prepare(template, targetDir);
        expect(await printTree(targetDir)).toMatchInlineSnapshot(`
          "(root)
              ├── files
              │   └── package.json
              ├── hooks
              │   └── install.mjs
              ├── index.js
              └── package.json"
        `);
        const scriptPath = path.join(targetDir, "hooks", "install.mjs");
        const content = await fs.readFile(scriptPath, "utf8");
        expect(content).toMatchInlineSnapshot(`
          "

          export default async (context                )                => {
              await context.writeFile("install.txt", "install script at v1.0.0");
              context.setMessage("custom instruction from v1.0.0");
          };
          "
        `);
    });
});

describe("parameters", () => {
    it("should be saved to template package.json", async () => {
        expect.assertions(1);
        const template = path.join(fixtureDir, "with-parameters@1.0.0");
        await prepare(template, targetDir);
        const packageJson = await readJsonFile<TemplatePackageJson>(
            path.join(targetDir, "package.json"),
        );
        expect(packageJson.cloneman.parameters).toEqual([
            {
                key: "repository",
                description: "Repository url",
                help: "This should be a valid URL to a Git repository",
                pattern: "git[+]https://.+",
                required: true,
            },
            {
                key: "description",
                description: "Project description",
                help: null,
                required: false,
                defaultValue: "Awesome project",
            },
        ]);
    });
});
