import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rmDir, temporaryDirectory } from "./test-utils";

let applicationPath: string;

beforeEach(() => {
    applicationPath = temporaryDirectory();
});

afterEach(async () => {
    await rmDir(applicationPath);
    vi.resetModules();
    vi.restoreAllMocks();
});

async function writePackageJson(content: unknown): Promise<void> {
    const filePath = path.join(applicationPath, "package.json");
    await fs.writeFile(filePath, JSON.stringify(content), "utf8");
}

async function importVerifyWithIsCi(
    isCi: boolean,
): Promise<(options: { applicationPath: string }) => Promise<void>> {
    vi.doMock(import("is-ci"), () => ({
        default: isCi,
    }));

    const { verify } = await import("./verify");
    return verify;
}

describe("verify", () => {
    it("should throw when application was generated from a different version than dependency in CI", async () => {
        expect.assertions(1);

        await writePackageJson({
            cloneman: {
                template: "my-template",
                version: "1.0.0",
            },
            devDependencies: {
                "my-template": "1.0.1",
            },
        });

        const verify = await importVerifyWithIsCi(true);

        await expect(verify({ applicationPath })).rejects.toMatchObject({
            name: "TemplateVersionMismatchError",
        });
    });

    it("should print mismatch error without throwing in local environment", async () => {
        expect.assertions(2);

        await writePackageJson({
            cloneman: {
                template: "my-template",
                version: "1.0.0",
            },
            devDependencies: {
                "my-template": "1.0.1",
            },
        });

        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        const verify = await importVerifyWithIsCi(false);

        await expect(verify({ applicationPath })).resolves.toBeUndefined();
        expect(errorSpy).toHaveBeenCalledWith(expect.any(String));
    });

    it("should throw an error when template dependency is missing", async () => {
        expect.assertions(1);

        await writePackageJson({
            cloneman: {
                template: "my-template",
                version: "1.0.0",
            },
            devDependencies: {},
        });

        const verify = await importVerifyWithIsCi(true);

        await expect(verify({ applicationPath })).rejects.toMatchObject({
            name: "TemplateDependencyMissingError",
        });
    });

    it("should not throw an error when application is up-to-date", async () => {
        expect.assertions(1);

        await writePackageJson({
            cloneman: {
                template: "my-template",
                version: "1.0.0",
            },
            devDependencies: {
                "my-template": "1.0.0",
            },
        });

        const verify = await importVerifyWithIsCi(true);

        await expect(verify({ applicationPath })).resolves.toBeUndefined();
    });
});
