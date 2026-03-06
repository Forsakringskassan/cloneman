import { Console } from "node:console";
import path from "node:path";
import { WritableStreamBuffer } from "stream-buffers";
import { beforeEach, expect, it, vi } from "vitest";
import { createParser } from "./cli";

const fixtureDir = path.resolve(import.meta.dirname, "../../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template");

let stream: WritableStreamBuffer;

vi.mock(import("../update"), () => ({
    update: vi.fn(),
}));

beforeEach(() => {
    stream = new WritableStreamBuffer();
    globalThis.console = new Console(stream, stream);
});

it("should update application to latest", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update"]);
    expect(stream.getContentsAsString("utf8")).toContain(
        "Updating the application to version latest...",
    );
});

it("should update application to exact version", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update", "1.2.3"]);
    expect(stream.getContentsAsString("utf8")).toContain(
        "Updating the application to version 1.2.3...",
    );
});
