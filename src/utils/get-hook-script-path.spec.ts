import path from "node:path";
import { fs, vol } from "memfs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHookScriptPath } from "./get-hook-script-path";

/* eslint-disable vitest/prefer-import-in-mock -- the type of memfs is not 100% equivalent to node:fs */
vi.mock("node:fs", () => ({ default: fs }));
vi.mock("node:fs/promises", () => ({ default: fs.promises }));
/* eslint-enable vitest/prefer-import-in-mock */

beforeEach(() => {
    vol.reset();
});

function basename(value: string | undefined): string | undefined {
    return value ? path.basename(value) : undefined;
}

describe("should return script path", () => {
    const extensions = ["js", "cjs", "mjs", "ts", "cts", "mts"];

    it.each(extensions)("%s", (extension) => {
        expect.assertions(1);
        vol.fromJSON({
            [`/path/to/hooks/foo.${extension}`]: "stub content",
        });
        const result = getHookScriptPath("foo", "/path/to/hooks");
        expect(basename(result)).toBe(`foo.${extension}`);
    });
});

it("should handle when hook has multiple extensions", () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/hooks/foo.js": "stub content",
        "/path/to/hooks/foo.ts": "stub content",
    });
    const result = getHookScriptPath("foo", "/path/to/hooks");
    expect(basename(result)).toBeDefined();
});

it("should throw error if no hook exists", () => {
    expect.assertions(1);
    vol.fromJSON({});
    expect(() =>
        getHookScriptPath("foo", "/path/to/hooks"),
    ).toThrowErrorMatchingInlineSnapshot(
        `[Error: No "foo" hook found in "/path/to/hooks"]`,
    );
});

it("should throw error if no script with matching name exists", () => {
    expect.assertions(1);
    vol.fromJSON({
        "/path/to/hooks/bar.js": "stub content",
    });
    expect(() =>
        getHookScriptPath("foo", "/path/to/hooks"),
    ).toThrowErrorMatchingInlineSnapshot(
        `[Error: No "foo" hook found in "/path/to/hooks"]`,
    );
});
