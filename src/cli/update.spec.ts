import path from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import yoctoSpinner from "yocto-spinner";
import { createParser } from "./cli";

const fixtureDir = path.resolve(import.meta.dirname, "../../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template");

const mockSuccess = vi.fn();
const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    success: mockSuccess,
} as unknown as ReturnType<typeof yoctoSpinner>;

vi.mock(import("../update"), () => ({
    update: vi.fn(),
}));

vi.mock(import("yocto-spinner"), () => ({
    default: vi.fn(() => mockSpinner),
}));

beforeEach(() => {
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
    expect(yoctoSpinner).toHaveBeenCalledWith({
        text: "Updating template package to version latest...",
    });
    expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining("latest"));
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(`
Now run:

  npm install
    `);
});

it("should update application to exact version", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update", "1.2.3"]);
    expect(yoctoSpinner).toHaveBeenCalledWith({
        text: "Updating template package to version 1.2.3...",
    });
    expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining("1.2.3"));
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(`
Now run:

  npm install
    `);
});
