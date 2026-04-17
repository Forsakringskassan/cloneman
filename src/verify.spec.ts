import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    TemplateDependencyMissingError,
    TemplateVersionMismatchError,
} from "./errors";
import { rmDir, temporaryDirectory } from "./test-utils";
import { verify } from "./verify";

let applicationPath: string;

beforeEach(() => {
    applicationPath = temporaryDirectory();
});

afterEach(async () => {
    await rmDir(applicationPath);
});

async function writePackageJson(content: unknown): Promise<void> {
    const filePath = path.join(applicationPath, "package.json");
    await fs.writeFile(filePath, JSON.stringify(content), "utf8");
}

describe("verify", () => {
    it("should throw an error when application was generated from a different version than dependency", async () => {
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

        await expect(verify({ applicationPath })).rejects.toThrow(
            TemplateVersionMismatchError,
        );
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

        await expect(verify({ applicationPath })).rejects.toThrow(
            TemplateDependencyMissingError,
        );
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

        await expect(verify({ applicationPath })).resolves.toBeUndefined();
    });
});
