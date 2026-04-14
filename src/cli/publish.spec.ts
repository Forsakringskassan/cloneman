import { Console } from "node:console";
import path from "node:path";
import { WritableStreamBuffer } from "stream-buffers";
import { beforeEach, expect, it, vi } from "vitest";
import { TEMPLATE_BUILD_PATH } from "../constants";
import { prepare } from "../prepare";
import { publish } from "../publish";
import { createParser } from "./cli";

vi.mock(import("../prepare"), () => ({
    prepare: vi.fn(),
}));

vi.mock(import("../publish"), () => ({
    publish: vi.fn(),
}));

const fixtureDir = path.resolve(import.meta.dirname, "../../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template");

let stream: WritableStreamBuffer;

beforeEach(() => {
    stream = new WritableStreamBuffer();
    globalThis.console = new Console(stream, stream);
    vi.mocked(publish).mockResolvedValue(undefined);
    vi.mocked(prepare).mockResolvedValue({ output: "" });
});

it("publish app", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["publish"]);
    expect(publish).toHaveBeenCalledExactlyOnceWith({
        cwd: path.join(baseTemplate, TEMPLATE_BUILD_PATH),
    });
    expect(stream.getContentsAsString("utf8")).toMatchInlineSnapshot(`
      "Publishing template
      "
    `);
});
