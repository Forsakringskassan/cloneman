import path from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import yoctoSpinner from "yocto-spinner";
import { createParser } from "./cli";

const fixtureDir = path.resolve(import.meta.dirname, "../../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template");

const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    success: vi.fn(),
} as unknown as ReturnType<typeof yoctoSpinner>;

vi.mock(import("../update"), () => ({
    update: vi.fn(),
}));

vi.mock(import("yocto-spinner"), () => ({
    default: vi.fn(() => mockSpinner),
}));

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
});
