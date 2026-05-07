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
import { update } from "./update";
import { writeJsonFile } from "./utils";
import { type ApplicationPackageJson } from "./utils/package-json";

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
        });
        const packageJson =
            await readJsonFile<ApplicationPackageJson>("package.json");
        packageJson.description = "description";
        packageJson.version = "0.0.1";

        await writeJsonFile(path.join(appDir, "package.json"), packageJson);
    });

    it("should update existing project", async () => {
        expect.assertions(9);

        expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
            `boilerplate file at v1.0.0`,
        );
        expect(await readFile("managed.txt")).toMatchInlineSnapshot(
            `managed file at v1.0.0`,
        );

        /* update the application to version 1.0.1 */
        await update(appDir, "1.0.1", userEnv);
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
    });

    it("should set actual version to the resolved version if input version is 'latest'", async () => {
        expect.assertions(1);

        await update(appDir, "latest", userEnv);
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
        await writeJsonFile(path.join(appDir, "package.json"), packageJson);

        await update(appDir, "1.0.1", userEnv);
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
        await writeJsonFile(path.join(appDir, "package.json"), packageJson);

        await update(appDir, "1.0.1", userEnv);

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
        await writeJsonFile(path.join(appDir, "package.json"), applicationJson);

        await update(appDir, "1.0.2", userEnv);

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
    expect.assertions(7);

    /* create the initial application using template at version 1.0.0 */
    await create({
        name: "mock-app",
        templatePackage: "@forsakringskassan/base-template@1.0.0",
        cwd,
        env: userEnv,
    });
    expect(await readFile("boilerplate.txt")).toMatchInlineSnapshot(
        `boilerplate file at v1.0.0`,
    );
    expect(await readFile("managed.txt")).toMatchInlineSnapshot(
        `managed file at v1.0.0`,
    );
    expect(await readFile("install.txt")).toMatchInlineSnapshot(
        `install script at v1.0.0`,
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
    await update(appDir, tarballPath, userEnv);
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
    expect(await readFile("install.txt")).toMatchInlineSnapshot(
        `install script at v1.0.1`,
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
    });

    /* try to update to a non-existing tarball */
    const invalidTarPath = path.join(appDir, "base-template-4.0.4.tgz");
    await expect(update(appDir, invalidTarPath, userEnv)).rejects.toThrow(
        `Tarball not found at path`,
    );
});

it.todo("should run install hook if present");
