import { Console } from "node:console";
import path from "node:path";
import { WritableStreamBuffer } from "stream-buffers";
import { beforeEach, expect, it, vi } from "vitest";
import { pack } from "../pack";
import { prepare } from "../prepare";
import { createParser } from "./cli";

vi.mock(import("../prepare"), () => ({
    prepare: vi.fn(),
}));

vi.mock(import("../pack"), () => ({
    pack: vi.fn(),
}));

const fixtureDir = path.resolve(import.meta.dirname, "../../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template");

let stream: WritableStreamBuffer;

beforeEach(() => {
    stream = new WritableStreamBuffer();
    globalThis.console = new Console(stream, stream);
    vi.mocked(prepare).mockResolvedValue({ output: "" });
});

it("pack app", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["pack"]);
    expect(stream.getContentsAsString("utf8")).toMatchInlineSnapshot(`
      "Pack template

      "
    `);
});

it("should call pack with cwd and targetDir", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["pack"]);
    expect(pack).toHaveBeenCalledWith({
        cwd: baseTemplate,
        targetDir: path.join(baseTemplate, "temp/cloneman"),
    });
});
