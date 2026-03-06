import { Console } from "node:console";
import { WritableStreamBuffer } from "stream-buffers";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { create } from "../create";
import { createParser } from "./cli";

vi.mock(import("../create"), () => ({
    create: vi.fn(),
}));

let stream: WritableStreamBuffer;

beforeEach(() => {
    stream = new WritableStreamBuffer();
    globalThis.console = new Console(stream, stream);
    vi.mocked(create).mockResolvedValue(undefined);
});

afterEach(() => {
    vi.clearAllMocks();
});

it("create app", async () => {
    expect.hasAssertions();
    const appName = "my-new-app";
    const templateName = "my-template";
    const parser = createParser({ cwd: "./new-app" }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["create", appName, templateName]);

    expect(create).toHaveBeenCalledExactlyOnceWith({
        name: appName,
        templatePackage: templateName,
        cwd: "./new-app",
    });

    expect(stream.getContentsAsString("utf8")).toContain(
        `Creating app ${appName} from template ${templateName}`,
    );
});
