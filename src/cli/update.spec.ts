import path from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { update } from "../update";
import { createParser } from "./cli";

vi.mock(import("../update"), () => ({
    update: vi.fn(),
}));

const fixtureDir = path.resolve(import.meta.dirname, "../../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template");

const mockMessage = "lorem ipsum";

beforeEach(() => {
    vi.mocked(update).mockResolvedValue({
        message: mockMessage,
    });
    vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(() => {
    vi.clearAllMocks();
});

it("should update application to latest", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update"]);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(mockMessage);
});

it("should update application to exact version", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update", "1.2.3"]);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(mockMessage);
});

it("should not pass if-same-filehash if param omitted", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: "./my-app" }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update"]);

    expect(update).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
            ifSameFilehash: false,
        }),
    );
});

it("should pass with --if-same-filehash", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: "./my-app" }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update", "--if-same-filehash"]);

    expect(update).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
            ifSameFilehash: true,
        }),
    );
});

it("should pass with --install", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: "./my-app" }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update", "--install"]);

    expect(update).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
            npmInstall: true,
        }),
    );
});
