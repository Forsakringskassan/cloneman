import { fs, vol } from "memfs";
import { beforeEach, expect, it, vi } from "vitest";
import { writeJsonFile } from "./write-json-file";

/* eslint-disable vitest/prefer-import-in-mock -- the type of memfs is not 100% equivalent to node:fs */
vi.mock("node:fs", () => ({ default: fs }));
vi.mock("node:fs/promises", () => ({ default: fs.promises }));
/* eslint-enable vitest/prefer-import-in-mock */

const filename = "/path/to/file.json";

beforeEach(async () => {
    vol.reset();
    await fs.promises.mkdir("/path/to", { recursive: true });
});

it("should write JSON to a new file", async () => {
    expect.assertions(1);
    await writeJsonFile(filename, { foo: "bar" }, { indent: 2, trailer: "" });
    const raw = await fs.promises.readFile(filename, "utf8");
    expect(raw.toString()).toBe('{\n  "foo": "bar"\n}');
});

it("should use trailing newline from options when file does not exist", async () => {
    expect.assertions(1);
    await writeJsonFile(filename, { foo: "bar" }, { indent: 2, trailer: "\n" });
    const raw = await fs.promises.readFile(filename, "utf8");
    expect(raw.toString()).toBe('{\n  "foo": "bar"\n}\n');
});

it("should overwrite an existing file", async () => {
    expect.assertions(1);
    vol.fromJSON({ "/path/to/file.json": '{"foo":"old"}' });
    await writeJsonFile(filename, { foo: "new" }, { indent: 2, trailer: "" });
    const raw = await fs.promises.readFile(filename, "utf8");
    expect(raw.toString()).toBe('{\n  "foo": "new"\n}');
});

it("should preserve LF trailing newline from existing file", async () => {
    expect.assertions(1);
    vol.fromJSON({ "/path/to/file.json": '{"foo":"old"}\n' });
    await writeJsonFile(filename, { foo: "new" }, { indent: 2, trailer: "" });
    const raw = await fs.promises.readFile(filename, "utf8");
    expect(raw.toString()).toBe('{\n  "foo": "new"\n}\n');
});

it("should preserve CRLF trailing newline from existing file", async () => {
    expect.assertions(1);
    vol.fromJSON({ "/path/to/file.json": '{"foo":"old"}\r\n' });
    await writeJsonFile(filename, { foo: "new" }, { indent: 2, trailer: "" });
    const raw = await fs.promises.readFile(filename, "utf8");
    expect(raw.toString()).toBe('{\n  "foo": "new"\n}\r\n');
});

it("should not add trailing newline when existing file has none", async () => {
    expect.assertions(1);
    vol.fromJSON({ "/path/to/file.json": '{"foo":"old"}' });
    await writeJsonFile(filename, { foo: "new" }, { indent: 2, trailer: "\n" });
    const raw = await fs.promises.readFile(filename, "utf8");
    expect(raw.toString().endsWith("\n")).toBe(false);
});

it("should use the given indent", async () => {
    expect.assertions(1);
    vol.fromJSON({ "/path/to/.keep": "" });
    await writeJsonFile(filename, { foo: "bar" }, { indent: 4, trailer: "" });
    const raw = await fs.promises.readFile(filename, "utf8");
    expect(raw.toString()).toBe('{\n    "foo": "bar"\n}');
});
