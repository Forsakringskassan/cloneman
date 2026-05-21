import { fs, vol } from "memfs";
import { beforeEach, expect, it, vi } from "vitest";
import { readJsonFile } from "./read-json-file";
import { updateJsonFile } from "./update-json-file";

/* eslint-disable vitest/prefer-import-in-mock -- the type of memfs is not 100% equivalent to node:fs */
vi.mock("node:fs", () => ({ default: fs }));
vi.mock("node:fs/promises", () => ({ default: fs.promises }));
/* eslint-enable vitest/prefer-import-in-mock */

beforeEach(() => {
    vol.reset();
});

it("should update content in file", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.json": JSON.stringify({
            foo: "spam",
        }),
    });
    await updateJsonFile("/path/to/file.json", {
        foo: "ham",
    });
    const content = await readJsonFile("/path/to/file.json");
    expect(content).toEqual({
        foo: "ham",
    });
});

it("should update recursively", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.json": JSON.stringify({
            foo: {
                bar: {
                    baz: "spam",
                },
            },
        }),
    });
    await updateJsonFile("/path/to/file.json", {
        foo: {
            bar: {
                baz: "ham",
            },
        },
    });
    const content = await readJsonFile("/path/to/file.json");
    expect(content).toEqual({
        foo: {
            bar: {
                baz: "ham",
            },
        },
    });
});

it("should update retain existing keys", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.json": JSON.stringify({
            a1: {
                b1: 1,
                b2: 2,
                b3: {
                    c1: 3,
                },
            },
            a2: 4,
        }),
    });
    await updateJsonFile("/path/to/file.json", {
        a1: {
            b2: 42,
        },
    });
    const content = await readJsonFile("/path/to/file.json");
    expect(content).toEqual({
        a1: {
            b1: 1,
            b2: 42,
            b3: {
                c1: 3,
            },
        },
        a2: 4,
    });
});

it("should add new keys", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.json": JSON.stringify({
            foo: {
                bar: "spam",
            },
        }),
    });
    await updateJsonFile("/path/to/file.json", {
        foo: {
            baz: "ham",
        },
    });
    const content = await readJsonFile("/path/to/file.json");
    expect(content).toEqual({
        foo: {
            bar: "spam",
            baz: "ham",
        },
    });
});

it("should remove keys set to undefined", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.json": JSON.stringify({
            foo: {
                bar: "spam",
                baz: "ham",
            },
        }),
    });
    await updateJsonFile("/path/to/file.json", {
        foo: {
            bar: undefined,
        },
    });
    const content = await readJsonFile("/path/to/file.json");
    expect(content).toEqual({
        foo: {
            baz: "ham",
        },
    });
});

it("should replace arrays", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.json": JSON.stringify({
            foo: [1, 2],
            bar: [3, 4],
        }),
    });
    await updateJsonFile("/path/to/file.json", {
        foo: [5, 6],
    });
    const content = await readJsonFile("/path/to/file.json");
    expect(content).toEqual({
        foo: [5, 6],
        bar: [3, 4],
    });
});

it("should preserve LF trailing newline when present", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.json": '{"foo":"bar"}\n',
    });
    await updateJsonFile("/path/to/file.json", { foo: "baz" });
    const raw = await fs.promises.readFile("/path/to/file.json", "utf8");
    expect(raw.toString().endsWith("\n")).toBe(true);
});

it("should preserve CRLF trailing newline when present", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.json": '{"foo":"bar"}\r\n',
    });
    await updateJsonFile("/path/to/file.json", { foo: "baz" });
    const raw = await fs.promises.readFile("/path/to/file.json", "utf8");
    expect(raw.toString().endsWith("\r\n")).toBe(true);
});

it("should not add trailing newline when not present", async () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/file.json": '{"foo":"bar"}',
    });
    await updateJsonFile("/path/to/file.json", { foo: "baz" });
    const raw = await fs.promises.readFile("/path/to/file.json", "utf8");
    expect(raw.toString().endsWith("\n")).toBe(false);
});
