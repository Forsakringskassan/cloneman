import path from "node:path";
import { fs, vol } from "memfs";
import { beforeEach, expect, it, vi } from "vitest";
import { createManagedFilesHash } from "./create-managed-files-hash";

/* eslint-disable vitest/prefer-import-in-mock -- memfs is not fully type-compatible with node:fs */
vi.mock("node:fs/promises", () => ({ default: fs.promises }));
/* eslint-enable vitest/prefer-import-in-mock */

beforeEach(() => {
    vol.reset();
});

it("should create a hash from managed files and hooks", async () => {
    expect.assertions(1);

    const filesDir = "template/files/";
    const hooksDir = ".cloneman/";

    vol.fromJSON({
        [path.join(filesDir, "README.md")]: "Template contents",
        [path.join(hooksDir, "install.js")]: "Hook contents",
    });

    const hash = await createManagedFilesHash(
        filesDir,
        hooksDir,
        ["README.md"],
        {
            name: "example",
            version: "1.0.0",
        },
    );

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
});

it("should change the hash when a managed package.json script changes", async () => {
    expect.assertions(1);

    const filesDir = "/template/files";
    const hooksDir = "/template/hooks";
    const managedPackagePath = path.join(filesDir, "nested", "package.json");

    vol.fromJSON({
        [managedPackagePath]: JSON.stringify({
            name: "example",
            version: "1.0.0",
            scripts: { test: "vitest run" },
        }),
    });

    const initialHash = await createManagedFilesHash(
        filesDir,
        hooksDir,
        ["nested/package.json"],
        {
            name: "template",
            version: "1.0.0",
        },
    );

    vol.fromJSON({
        [managedPackagePath]: JSON.stringify({
            name: "example",
            version: "1.0.0",
            scripts: { test: "vitest" },
        }),
    });

    const updatedHash = await createManagedFilesHash(
        filesDir,
        hooksDir,
        ["nested/package.json"],
        {
            name: "template",
            version: "1.0.0",
        },
    );

    expect(updatedHash).not.toBe(initialHash);
});

it("should keep the same hash when managed package dependencies change", async () => {
    expect.assertions(1);

    const filesDir = "/template/files";
    const hooksDir = "/template/hooks";
    const managedPackagePath = path.join(filesDir, "nested", "package.json");

    vol.fromJSON({
        [managedPackagePath]: JSON.stringify({
            name: "example",
            version: "1.0.0",
            dependencies: { "@forsakringskassan/alpha": "1.0.0" },
            devDependencies: { "@forsakringskassan/bravo": "1.0.0" },
        }),
    });

    const initialHash = await createManagedFilesHash(
        filesDir,
        hooksDir,
        ["nested/package.json"],
        {
            name: "template",
            version: "1.0.0",
        },
    );

    vol.fromJSON({
        [managedPackagePath]: JSON.stringify({
            name: "example",
            version: "1.0.0",
            dependencies: { "@forsakringskassan/alpha": "2.0.0" },
            devDependencies: { "@forsakringskassan/bravo": "2.0.0" },
        }),
    });

    const updatedHash = await createManagedFilesHash(
        filesDir,
        hooksDir,
        ["nested/package.json"],
        {
            name: "template",
            version: "1.0.0",
        },
    );

    expect(updatedHash).toBe(initialHash);
});

it("should change the hash when a hook file changes", async () => {
    expect.assertions(1);

    const filesDir = "/template/files";
    const hooksDir = "/template/hooks";
    const hookPath = path.join(hooksDir, "install.js");

    vol.fromJSON({
        [hookPath]: "console.log('initial');",
    });

    const initialHash = await createManagedFilesHash(filesDir, hooksDir, [], {
        name: "template",
        version: "1.0.0",
    });

    vol.fromJSON({
        [hookPath]: "console.log('updated');",
    });

    const updatedHash = await createManagedFilesHash(filesDir, hooksDir, [], {
        name: "template",
        version: "1.0.0",
    });

    expect(updatedHash).not.toBe(initialHash);
});
