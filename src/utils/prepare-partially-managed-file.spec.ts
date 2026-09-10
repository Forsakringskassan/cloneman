import { fs, vol } from "memfs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { preparePartiallyManagedFile } from "./prepare-partially-managed-file";

// eslint-disable-next-line vitest/prefer-import-in-mock -- the type of memfs is not 100% equivalent to node:fs
vi.mock("node:fs/promises", async () => {
    const { fs } = await import("memfs");

    return {
        readFile: fs.promises.readFile,
        writeFile: fs.promises.writeFile,
    };
});

expect.addSnapshotSerializer({
    test(value) {
        return typeof value === "string";
    },
    serialize: String,
});

beforeEach(() => {
    vol.reset();
});

describe("above", () => {
    it("should not modify file if marker is present", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/file.txt": [
                "foo spam bar",
                "# above managed by template",
                "lorem spam spam ipsum",
            ].join("\n"),
        });

        await preparePartiallyManagedFile(
            {
                name: "file.txt",
                include: { above: "# above managed by template" },
            },
            "/path/to/file.txt",
        );

        const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          # above managed by template
          lorem spam spam ipsum          
        `);
    });

    it("should add marker if missing in file", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/file.txt": ["foo spam bar", "lorem spam spam ipsum"].join(
                "\n",
            ),
        });

        await preparePartiallyManagedFile(
            {
                name: "file.txt",
                include: { above: "# above managed by template" },
            },
            "/path/to/file.txt",
        );

        const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          lorem spam spam ipsum
          # above managed by template
        `);
    });
});

describe("below", () => {
    it("should not modify file if marker is present", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/file.txt": [
                "foo spam bar",
                "# below managed by template",
                "lorem spam spam ipsum",
            ].join("\n"),
        });

        await preparePartiallyManagedFile(
            {
                name: "file.txt",
                include: { below: "# below managed by template" },
            },
            "/path/to/file.txt",
        );

        const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          # below managed by template
          lorem spam spam ipsum
        `);
    });

    it("should add marker if missing in file", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/file.txt": ["foo spam bar", "lorem spam spam ipsum"].join(
                "\n",
            ),
        });

        await preparePartiallyManagedFile(
            {
                name: "file.txt",
                include: { below: "# below managed by template" },
            },
            "/path/to/file.txt",
        );

        const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
        expect(content).toMatchInlineSnapshot(`
          # below managed by template
          foo spam bar
          lorem spam spam ipsum
        `);
    });
});

describe("block", () => {
    it("should not modify file when both markers are present", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/file.txt": [
                "foo spam bar",
                "# begin managed by template",
                "lorem spam spam ipsum",
                "# end managed by template",
            ].join("\n"),
        });

        await preparePartiallyManagedFile(
            {
                name: "file.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/file.txt",
        );

        const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          # begin managed by template
          lorem spam spam ipsum
          # end managed by template
        `);
    });

    it("should add markers when both are missing", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/file.txt": ["foo spam bar", "lorem spam spam ipsum"].join(
                "\n",
            ),
        });

        await preparePartiallyManagedFile(
            {
                name: "file.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/file.txt",
        );

        const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
        expect(content).toMatchInlineSnapshot(`
          # begin managed by template
          foo spam bar
          lorem spam spam ipsum
          # end managed by template
        `);
    });

    it("should add begin marker when missing", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/file.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
                "# end managed by template",
            ].join("\n"),
        });

        await preparePartiallyManagedFile(
            {
                name: "file.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/file.txt",
        );

        const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
        expect(content).toMatchInlineSnapshot(`
          # begin managed by template
          foo spam bar
          lorem spam spam ipsum
          # end managed by template
        `);
    });

    it("should add end marker when missing", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/file.txt": [
                "foo spam bar",
                "# begin managed by template",
                "lorem spam spam ipsum",
            ].join("\n"),
        });

        await preparePartiallyManagedFile(
            {
                name: "file.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/file.txt",
        );

        const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          # begin managed by template
          lorem spam spam ipsum
          # end managed by template
        `);
    });
});
