import { fs, vol } from "memfs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { patchPartiallyManagedFile } from "./patch-partially-managed-file";

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

it("should throw error when template file doesn't exist", async () => {
    expect.assertions(1);
    await expect(
        patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { above: "# above managed by template" },
            },
            "/path/to/nonexistent.txt",
            "/path/to/target.txt",
        ),
    ).rejects.toThrow();
});

describe("above", () => {
    it("should create target file with template content when target doesn't exist and template has marker", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "# above managed by template",
                "lorem spam spam ipsum",
                "spam",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { above: "# above managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          # above managed by template
          lorem spam spam ipsum
          spam
        `);
    });

    it("should create target file with template content and add marker when target doesn't exist and template has no marker", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
                "spam",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { above: "# above managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          lorem spam spam ipsum
          spam
          # above managed by template
        `);
    });

    it("should prepend template content with marker to existing target when neither file has marker", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
                "spam",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": ["asdf", "spam", "fdsa"].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { above: "# above managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          lorem spam spam ipsum
          spam
          # above managed by template
          asdf
          spam
          fdsa
        `);
    });

    it("should prepend target content with template content when template has marker and target doesn't", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
                "# above managed by template",
                "spam",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": ["asdf", "spam", "fdsa"].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { above: "# above managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          lorem spam spam ipsum
          # above managed by template
          asdf
          spam
          fdsa
        `);
    });

    it("should prepend template content at marker position when target has marker and template doesn't", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": [
                "asdf",
                "spam",
                "# above managed by template",
                "fdsa",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { above: "# above managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          lorem spam spam ipsum
          # above managed by template
          fdsa
        `);
    });

    it.todo(
        "should insert template content above marker position when both files have markers",
        async () => {
            expect.assertions(1);
            vol.fromJSON({
                "/path/to/template.txt": [
                    "foo spam bar",
                    "# above managed by template",
                    "lorem spam spam ipsum",
                ].join("\n"),
            });

            vol.fromJSON({
                "/path/to/target.txt": [
                    "asdf",
                    "# above managed by template",
                    "spam",
                    "fdsa",
                ].join("\n"),
            });

            await patchPartiallyManagedFile(
                {
                    name: "template.txt",
                    include: { above: "# above managed by template" },
                },
                "/path/to/template.txt",
                "/path/to/target.txt",
            );

            const content = await fs.promises.readFile(
                "/path/to/target.txt",
                "utf8",
            );
            expect(content).toMatchInlineSnapshot(`
            foo spam bar,
            # above managed by template
            spam
            fdsa
    `);
        },
    );
});

describe("below", () => {
    it("should create target file with template content when target doesn't exist and template has marker", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "# below managed by template",
                "lorem spam spam ipsum",
                "spam",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { below: "# below managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
              foo spam bar
              # below managed by template
              lorem spam spam ipsum
              spam
            `);
    });

    it("should create target file with template content and add marker when target doesn't exist and template has no marker", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
                "spam",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { below: "# below managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
              # below managed by template
              foo spam bar
              lorem spam spam ipsum
              spam
            `);
    });

    it("should append template content with marker to existing target when neither file has marker", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
                "spam",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": ["asdf", "spam", "fdsa"].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { below: "# below managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          asdf
          spam
          fdsa
          # below managed by template
          foo spam bar
          lorem spam spam ipsum
          spam
        `);
    });

    it("should append template content when template has marker and target doesn't", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo",
                "# below managed by template",
                "foo spam bar",
                "lorem spam spam ipsum",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": ["asdf", "spam", "fdsa"].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { below: "# below managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          asdf
          spam
          fdsa
          # below managed by template
          foo spam bar
          lorem spam spam ipsum
        `);
    });

    it("should insert template content at marker position when target has marker and template doesn't", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": [
                "asdf",
                "spam",
                "# below managed by template",
                "fdsa",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { below: "# below managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          asdf
          spam
          # below managed by template
          foo spam bar
          lorem spam spam ipsum
        `);
    });

    it("should include template content after marker when both files have markers", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "# below managed by template",
                "lorem spam spam ipsum",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": [
                "asdf",
                "# below managed by template",
                "spam",
                "fdsa",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: { below: "# below managed by template" },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          asdf
          # below managed by template
          lorem spam spam ipsum
        `);
    });
});

describe("block", () => {
    it("should create target file with template content when target doesn't exist and template has both markers", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "# begin managed by template",
                "lorem spam spam ipsum",
                "# end managed by template",
                "spam",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          foo spam bar
          # begin managed by template
          lorem spam spam ipsum
          # end managed by template
          spam
        `);
    });

    it("should create target file with template content and add missing marker when target doesn't exist and template has only one marker", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "# begin managed by template",
                "lorem spam spam ipsum",
                "spam",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
              foo spam bar
              # begin managed by template
              lorem spam spam ipsum
              spam
              # end managed by template
            `);
    });

    it("should create target file with template content and add both markers when target doesn't exist and template has no markers", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
                "spam",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
              # begin managed by template
              foo spam bar
              lorem spam spam ipsum
              spam
              # end managed by template
            `);
    });

    it("should prepand template content with markers to existing target when neither file has markers", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
                "spam",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": ["asdf", "spam", "fdsa"].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          # begin managed by template
          foo spam bar
          lorem spam spam ipsum
          spam
          # end managed by template
          asdf
          spam
          fdsa
        `);
    });

    it("should prepend content between markers with template content when template has markers and target doesn't", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "# begin managed by template",
                "lorem spam spam ipsum",
                "# end managed by template",
                "spam",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": ["asdf", "spam", "fdsa"].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          # begin managed by template
          lorem spam spam ipsum
          # end managed by template
          asdf
          spam
          fdsa
        `);
    });

    it("should replace content between markers with template content when target has markers and template doesn't", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "lorem spam spam ipsum",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": [
                "asdf",
                "spam",
                "# begin managed by template",
                "fdsa",
                "# end managed by template",
                "bottom line",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          asdf
          spam
          # begin managed by template
          foo spam bar
          lorem spam spam ipsum
          # end managed by template
          bottom line
        `);
    });

    it("should replace content between markers with template content when both files have markers", async () => {
        expect.assertions(1);
        vol.fromJSON({
            "/path/to/template.txt": [
                "foo spam bar",
                "# begin managed by template",
                "lorem spam spam ipsum",
                "# end managed by template",
                "bottom line",
            ].join("\n"),
        });

        vol.fromJSON({
            "/path/to/target.txt": [
                "asdf",
                "# begin managed by template",
                "spam",
                "# end managed by template",
                "fdsa",
            ].join("\n"),
        });

        await patchPartiallyManagedFile(
            {
                name: "template.txt",
                include: {
                    block: {
                        begin: "# begin managed by template",
                        end: "# end managed by template",
                    },
                },
            },
            "/path/to/template.txt",
            "/path/to/target.txt",
        );

        const content = await fs.promises.readFile(
            "/path/to/target.txt",
            "utf8",
        );
        expect(content).toMatchInlineSnapshot(`
          asdf
          # begin managed by template
          lorem spam spam ipsum
          # end managed by template
          fdsa
        `);
    });
});
