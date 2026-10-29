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

describe("renameFile()", () => {
    it("renames a file", async () => {
        expect.assertions(2);
        vol.fromJSON({ "/application/old.txt": "content" });

        await context.renameFile("old.txt", "new.txt");

        expect(await fs.readFile("/application/new.txt", "utf8")).toBe(
            "content",
        );
        expect(memfs.existsSync("/application/old.txt")).toBe(false);
    });

    it("throws when the source file does not exist by default", async () => {
        expect.assertions(1);

        await expect(
            context.renameFile("missing.txt", "new.txt"),
        ).rejects.toThrow();
    });

    it("does not throw when the source file does not exist and graceful is true", async () => {
        expect.assertions(1);

        await expect(
            context.renameFile("missing.txt", "new.txt", { graceful: true }),
        ).resolves.toBeUndefined();
    });
});
