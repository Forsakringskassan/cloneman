import type nodeFs from "node:fs/promises";
import { fs as memfs, vol } from "memfs";
import { beforeEach, describe, expect, it } from "vitest";
import { type InstallContext } from "../hooks";
import { createInstallContext } from "./create-install-context";

const fs = memfs.promises;

let context: InstallContext;

beforeEach(() => {
    vol.reset();
    context = createInstallContext({
        command: "create",
        targetDir: "/application",
        name: "example",
        version: { oldVersion: null, newVersion: "1.0.0" },
        fs: fs as unknown as typeof nodeFs,
        parameters: new Map(),
        setMessage: () => undefined,
    });
});

describe("ensureFile()", () => {
    it("creates a file and missing parent directories", async () => {
        expect.assertions(1);

        await context.ensureFile("config/local.json");

        await expect(
            fs.readFile("/application/config/local.json", "utf8"),
        ).resolves.toBe("");
    });

    it("does not change an existing file", async () => {
        expect.assertions(1);
        vol.fromJSON({ "/application/config.txt": "existing content" });

        await context.ensureFile("config.txt");

        await expect(
            fs.readFile("/application/config.txt", "utf8"),
        ).resolves.toBe("existing content");
    });
});
