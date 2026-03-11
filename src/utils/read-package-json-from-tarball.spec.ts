import fs from "node:fs/promises";
import path from "node:path";
import { create } from "tar";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { rmDir } from "../test-utils/rm-dir";
import { temporaryDirectory } from "../test-utils/temporary-directory";
import { readPackageJsonFromTarball } from "./read-package-json-from-tarball";

let tmpDir: string;
let tarballPath: string;

beforeEach(() => {
    tmpDir = temporaryDirectory();
    tarballPath = path.join(tmpDir, "package.tgz");
});

afterEach(async () => {
    await rmDir(tmpDir);
});

async function createTarball(
    packageJson: Record<string, unknown>,
    options: { omitPackageJson?: boolean } = {},
): Promise<void> {
    const packageDir = path.join(tmpDir, "package");
    await fs.mkdir(packageDir, { recursive: true });

    if (!options.omitPackageJson) {
        await fs.writeFile(
            path.join(packageDir, "package.json"),
            JSON.stringify(packageJson),
            "utf8",
        );
    }

    await fs.writeFile(
        path.join(packageDir, "index.js"),
        "// placeholder",
        "utf8",
    );

    await create(
        {
            gzip: true,
            file: tarballPath,
            cwd: tmpDir,
        },
        ["package"],
    );
}

describe("readPackageJsonFromTarball", () => {
    it("should read package.json from a valid tarball", async () => {
        expect.hasAssertions();

        await createTarball({ name: "my-package", version: "1.2.3" });

        const result = await readPackageJsonFromTarball(tarballPath);

        expect(result).toMatchObject({ name: "my-package", version: "1.2.3" });
    });

    it("should throw if the tarball path does not exist", async () => {
        expect.hasAssertions();

        const nonExistentPath = path.join(tmpDir, "does-not-exist.tgz");

        await expect(
            readPackageJsonFromTarball(nonExistentPath),
        ).rejects.toThrowError(
            `Tarball not found at path "${nonExistentPath}"`,
        );
    });

    it("should throw if the tarball does not contain package.json", async () => {
        expect.hasAssertions();

        await createTarball({}, { omitPackageJson: true });

        await expect(
            readPackageJsonFromTarball(tarballPath),
        ).rejects.toThrowError(
            `Could not find package.json in tarball "${tarballPath}"`,
        );
    });
});
