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
import { printTree } from "./test-utils";
import { rmDir } from "./test-utils/rm-dir";
import { temporaryDirectory } from "./test-utils/temporary-directory";
import { type ClientMetadata } from "./types";
import { update } from "./update";
import { type ApplicationPackageJson, writeJsonFile } from "./utils";

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

let cwd: string;
let appDir: string;

const userEnv = inject("userEnv");

function readFile(filePath: string): Promise<string> {
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

describe("update existing project with template from registry", () => {
    beforeEach(async () => {
        /* create the initial application using template at version 1.0.0 */
        await create({
            name: "mock-app",
            templatePackage: "@forsakringskassan/base-template@1.0.0",
            cwd,
            env: userEnv,
            parameters: new Map(),
        });
        const packageJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        packageJson.description = "description";
        packageJson.version = "0.0.1";
        packageJson.homepage = "package-homepage";
        packageJson.bugs = { url: "package-homepage/bugs" };
        packageJson.keywords = ["foo", "bar"];
        packageJson.repository = "git+package-homepage";

        await writeJsonFile(path.join(appDir, "package.json"), packageJson, {
            indent: 2,
            trailer: "",
        });
    });

    it("should update existing project", async () => {
        expect.assertions(14);

        expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
            `boilerplate file at v1.0.0`,
        );
        expect(await readFile("managed.txt")).toMatchInlineSnapshot(
            `managed file at v1.0.0`,
        );

        /* update the application to version 1.0.1 */
        await update({
            cwd: appDir,
            version: "1.0.1",
            env: userEnv,
            parameters: new Map(),
        });
        expect(await printTree(appDir)).toMatchInlineSnapshot(`
          (root)
              ├── .gitignore
              ├── .npmrc
              ├── boilerplate.txt
              ├── managed.txt
              ├── package-lock.json
              ├── package.json
              ├── renovate.json
              └── sub-folder
                  └── sub-file.txt
        `);
        expect(await readJsonFile("package.json")).toMatchObject({
            devDependencies: {
                "@forsakringskassan/base-template": "1.0.1",
                "@forsakringskassan/lib-used-by-templates": "1.0.0",
            },
        });
        expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
            `boilerplate file at v1.0.0`,
        );
        expect(await readFile("managed.txt")).toMatchInlineSnapshot(
            `managed file at v1.0.1`,
        );

        const applicationPackageJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        expect(applicationPackageJson.name).toBe("mock-app");
        expect(applicationPackageJson.description).toBe("description");
        expect(applicationPackageJson.version).toBe("0.0.1");
        expect(applicationPackageJson.scripts).toEqual({ a: "foo", b: "bar" });

        /* these fields should be intact, not overwritten */
        expect(applicationPackageJson.homepage).toBe("package-homepage");
        expect(applicationPackageJson.bugs).toEqual({
            url: "package-homepage/bugs",
        });
        expect(applicationPackageJson.keywords).toEqual(["foo", "bar"]);
        expect(applicationPackageJson.repository).toBe("git+package-homepage");
    });

    it("should set actual version to the resolved version if input version is 'latest'", async () => {
        expect.assertions(1);
        await update({
            cwd: appDir,
            version: "latest",
            env: userEnv,
            parameters: new Map(),
        });
        const packageJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        expect(
            packageJson.devDependencies?.["@forsakringskassan/base-template"],
        ).toBe("1.0.2");
    });

    it("should keep dependencies that are not in the template", async () => {
        expect.assertions(1);

        const packageJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        packageJson.dependencies = {
            "@forsakringskassan/lib-used-by-app": "1.2.3",
        };
        await writeJsonFile(path.join(appDir, "package.json"), packageJson, {
            indent: 2,
            trailer: "",
        });

        await update({
            cwd: appDir,
            version: "1.0.1",
            env: userEnv,
            parameters: new Map(),
        });
        const updatedPackageJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        expect(updatedPackageJson.dependencies).toEqual({
            "@forsakringskassan/lib-used-by-app": "1.2.3",
            "@forsakringskassan/api-lib-a": "1.1.0",
            "@forsakringskassan/api-lib-b": "1.1.0",
        });
    });

    it("should not update a dependency that the template has added in ignoredDependencies", async () => {
        expect.assertions(1);

        const packageJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        packageJson.dependencies = {
            ...packageJson.dependencies,
            "@forsakringskassan/lib-used-by-templates": "1.2.3",
        };
        await writeJsonFile(path.join(appDir, "package.json"), packageJson, {
            indent: 2,
            trailer: "",
        });

        await update({
            cwd: appDir,
            version: "1.0.1",
            env: userEnv,
            parameters: new Map(),
        });

        const updatedPackageJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        expect(updatedPackageJson.dependencies).toEqual({
            "@forsakringskassan/lib-used-by-templates": "1.2.3",
            "@forsakringskassan/api-lib-a": "1.1.0",
            "@forsakringskassan/api-lib-b": "1.1.0",
        });
    });

    it("should remove packages listed in uninstallDependencies from both dependencies and devDependencies", async () => {
        expect.assertions(2);

        const applicationJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        applicationJson.dependencies = {
            "@forsakringskassan/old-lib": "2.0.0",
            "@forsakringskassan/lib-used-by-app": "1.2.3",
        };
        applicationJson.devDependencies = {
            ...applicationJson.devDependencies,
            "@forsakringskassan/old-lib": "2.0.0",
        };
        await writeJsonFile(
            path.join(appDir, "package.json"),
            applicationJson,
            {
                indent: 2,
                trailer: "",
            },
        );

        await update({
            cwd: appDir,
            version: "1.0.2",
            env: userEnv,
            parameters: new Map(),
        });

        const updatedPackageJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        expect(updatedPackageJson.dependencies).toEqual({
            "@forsakringskassan/lib-used-by-app": "1.2.3",
            "@forsakringskassan/api-lib-a": "1.1.0",
            "@forsakringskassan/api-lib-b": "1.1.0",
        });
        expect(updatedPackageJson.devDependencies).not.toHaveProperty(
            "@forsakringskassan/old-lib",
        );
    });
});

it("should update existing project from local tar", async () => {
    expect.assertions(6);

    /* create the initial application using template at version 1.0.0 */
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/base-template@1.0.0",
        cwd,
        env: userEnv,
        parameters: new Map(),
    });
    expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
        `boilerplate file at v1.0.0`,
    );
    expect(await readFile("managed.txt")).toMatchInlineSnapshot(
        `managed file at v1.0.0`,
    );

    /* create a local tarball for version 1.0.1 */
    const fixturePath = path.resolve(
        import.meta.dirname,
        "../fixtures",
        "base-template@1.0.1",
    );
    const targetDir = temporaryDirectory();
    await prepare(fixturePath, targetDir);
    await pack({ cwd: targetDir, targetDir });
    const tarballPath = path.join(
        targetDir,
        "forsakringskassan-base-template-1.0.1.tgz",
    );
    const relativeTarballPath = path.relative(appDir, tarballPath);

    /* update the application using the local tarball */
    await update({
        cwd: appDir,
        version: tarballPath,
        env: userEnv,
        parameters: new Map(),
    });
    expect(await printTree(appDir)).toMatchInlineSnapshot(`
      (root)
          ├── .gitignore
          ├── .npmrc
          ├── boilerplate.txt
          ├── managed.txt
          ├── package-lock.json
          ├── package.json
          ├── renovate.json
          └── sub-folder
              └── sub-file.txt
    `);
    expect(await readJsonFile("package.json")).toMatchObject({
        devDependencies: {
            "@forsakringskassan/base-template": expect.stringContaining(
                relativeTarballPath.replaceAll("\\", "/"),
            ),
            "@forsakringskassan/lib-used-by-templates": "1.0.0",
        },
    });
    expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
        `boilerplate file at v1.0.0`,
    );
    expect(await readFile("managed.txt")).toMatchInlineSnapshot(
        `managed file at v1.0.1`,
    );
});

it("should crash if invalid tar path", async () => {
    expect.assertions(1);

    /* create the initial application using template at version 1.0.0 */
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/base-template@1.0.0",
        cwd,
        env: userEnv,
        parameters: new Map(),
    });

    /* try to update to a non-existing tarball */
    const invalidTarPath = path.join(appDir, "base-template-4.0.4.tgz");
    await expect(
        update({
            cwd: appDir,
            version: invalidTarPath,
            env: userEnv,
            parameters: new Map(),
        }),
    ).rejects.toThrow(`Tarball not found at path`);
});

it("should remove files set in removeFiles", async () => {
    expect.assertions(2);
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/with-removed-files@1.0.0",
        cwd,
        env: userEnv,
        parameters: new Map(),
    });
    /* should have created file.js and file.json */
    expect(await printTree(appDir)).toMatchInlineSnapshot(`
      (root)
          ├── file.js
          ├── file.json
          ├── package-lock.json
          └── package.json
    `);
    await update({
        cwd: appDir,
        version: "1.0.1",
        env: userEnv,
        parameters: new Map(),
    });
    /* should have renamed file.js to file.mts, while keeping file.json */
    expect(await printTree(appDir)).toMatchInlineSnapshot(`
      (root)
          ├── file.json
          ├── file.mts
          ├── package-lock.json
          └── package.json
    `);
});

it("should return a default instructions message", async () => {
    expect.assertions(1);
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/base-template@1.0.0",
        cwd,
        env: userEnv,
        parameters: new Map(),
    });
    const { message } = await update({
        cwd: appDir,
        version: "1.0.1",
        env: userEnv,
        parameters: new Map(),
    });
    expect(message).toMatchInlineSnapshot(`
      Now run:

        npm install
    `);
});

it("should run install hook if present", async () => {
    expect.assertions(3);
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/with-install-hook@1.0.0",
        cwd,
        env: userEnv,
        parameters: new Map(),
    });
    const { message } = await update({
        cwd: appDir,
        version: "1.0.1",
        env: userEnv,
        parameters: new Map(),
    });
    expect(await printTree(appDir)).toMatchInlineSnapshot(`
      (root)
          ├── install.txt
          ├── package-lock.json
          └── package.json
    `);
    expect(await readFile("install.txt")).toMatchInlineSnapshot(
        `install script at v1.0.1`,
    );
    expect(message).toMatchInlineSnapshot(`custom instruction from v1.0.1`);
});

it("should keep existing parameters when updating without overrides", async () => {
    expect.assertions(2);
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/with-parameters-template@1.0.0",
        cwd,
        env: userEnv,
        parameters: new Map([
            ["repository", "git+https://example.net/repo"],
            ["description", ""],
        ]),
    });
    await update({
        cwd: appDir,
        version: "1.0.0",
        env: userEnv,
        parameters: new Map(),
    });
    const { cloneman } = await readJsonFile<{ cloneman?: ClientMetadata }>(
        "package.json",
    );
    expect(cloneman?.parameters).toEqual({
        repository: "git+https://example.net/repo",
        description: "",
    });
    expect(await readFile("parameters.txt")).toMatchInlineSnapshot(`
      repository=git+https://example.net/repo
      description=
    `);
});

it("should override existing parameters when updating with overrides", async () => {
    expect.assertions(2);
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/with-parameters-template@1.0.0",
        cwd,
        env: userEnv,
        parameters: new Map([
            ["repository", "git+https://example.net/repo"],
            ["description", ""],
        ]),
    });
    await update({
        cwd: appDir,
        version: "1.0.0",
        env: userEnv,
        parameters: new Map([
            ["repository", "git+https://example.net/overridden"],
            ["description", ""],
        ]),
    });
    const { cloneman } = await readJsonFile<{ cloneman?: ClientMetadata }>(
        "package.json",
    );
    expect(cloneman?.parameters).toEqual({
        repository: "git+https://example.net/overridden",
        description: "",
    });
    expect(await readFile("parameters.txt")).toMatchInlineSnapshot(`
      repository=git+https://example.net/overridden
      description=
    `);
});
