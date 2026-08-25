import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { verify } from "../verify";
import { createParser } from "./cli";

vi.mock(import("../verify"), () => ({
    verify: vi.fn(),
}));

beforeEach(() => {
    vi.mocked(verify).mockResolvedValue(undefined);
});

afterEach(() => {
    vi.clearAllMocks();
});

it("verify app", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: "./my-app" }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["verify"]);

    expect(verify).toHaveBeenCalledExactlyOnceWith({
        applicationPath: "./my-app",
        managedFilesOnly: false,
        env: {},
    });
});

it("verify app with --managed-files-only", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: "./my-app" }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["verify", "--managed-files-only"]);

    expect(verify).toHaveBeenCalledExactlyOnceWith({
        applicationPath: "./my-app",
        managedFilesOnly: true,
        env: {},
    });
});
