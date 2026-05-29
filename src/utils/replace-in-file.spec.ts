import { fs, vol } from "memfs";
import { beforeEach, expect, it, vi } from "vitest";
import { replaceInFile } from "./replace-in-file";

/* eslint-disable vitest/prefer-import-in-mock -- the type of memfs is not 100% equivalent to node:fs */
vi.mock("node:fs", () => ({ default: fs }));
vi.mock("node:fs/promises", () => ({ default: fs.promises }));
/* eslint-enable vitest/prefer-import-in-mock */

expect.addSnapshotSerializer({
    test(value) {
        return typeof value === "string";
    },
    serialize(value) {
        return String(value);
    },
});

beforeEach(() => {
    vol.reset();
});

it("should replace string in file", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.txt": ["foo", "bar", "baz"].join("\n"),
    });
    await replaceInFile("/path/to/file.txt", {
        pattern: "bar",
        replacement: "spam",
    });
    const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
    expect(content).toMatchInlineSnapshot(`
      foo
      spam
      baz
    `);
});

it("should replace regexp in file", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.txt": ["foo", "bar", "baz"].join("\n"),
    });
    await replaceInFile("/path/to/file.txt", {
        pattern: /bar/g,
        replacement: "spam",
    });
    const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
    expect(content).toMatchInlineSnapshot(`
      foo
      spam
      baz
    `);
});

it("should replace all occurrences pattern in file", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.txt": [
            "foo spam bar",
            "lorem spam spam ipsum",
            "spam",
        ].join("\n"),
    });
    await replaceInFile("/path/to/file.txt", {
        pattern: "spam",
        replacement: "ham",
    });
    const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
    expect(content).toMatchInlineSnapshot(`
      foo ham bar
      lorem ham ham ipsum
      ham
    `);
});

it("should preserve trailing newline", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.txt": "foo\n",
    });
    await replaceInFile("/path/to/file.txt", {
        pattern: "foo",
        replacement: "bar",
    });
    const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
    expect(content).toBe("bar\n");
});

it("should not add trailing newline", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.txt": "foo",
    });
    await replaceInFile("/path/to/file.txt", {
        pattern: "foo",
        replacement: "bar",
    });
    const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
    expect(content).toBe("bar");
});

it("should replace only lines matching regexp", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.txt": ["foo", "prefix: foo", "something: foo"].join(
            "\n",
        ),
    });
    await replaceInFile("/path/to/file.txt", {
        match: /^prefix:/,
        pattern: "foo",
        replacement: "spam",
    });
    const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
    expect(content).toMatchInlineSnapshot(`
      foo
      prefix: spam
      something: foo
    `);
});

it("should handle global flag for matcher", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.txt": ["foo", "prefix: foo", "something: foo"].join(
            "\n",
        ),
    });
    await replaceInFile("/path/to/file.txt", {
        match: /^prefix:/g,
        pattern: "foo",
        replacement: "spam",
    });
    const content = await fs.promises.readFile("/path/to/file.txt", "utf8");
    expect(content).toMatchInlineSnapshot(`
      foo
      prefix: spam
      something: foo
    `);
});
