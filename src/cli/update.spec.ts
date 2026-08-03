import path from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import yoctoSpinner from "yocto-spinner";
import { update } from "../update";
import { createParser } from "./cli";

vi.mock(import("../update"), () => ({
    update: vi.fn(),
}));

const fixtureDir = path.resolve(import.meta.dirname, "../../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template");

const mockMessage = "lorem ipsum";
const mockSuccess = vi.fn();
const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    success: mockSuccess,
} as unknown as ReturnType<typeof yoctoSpinner>;

vi.mock(import("yocto-spinner"), () => ({
    default: vi.fn(() => mockSpinner),
}));

beforeEach(() => {
    vi.mocked(update).mockResolvedValue({
        message: mockMessage,
        resolvedVersion: "1.2.3",
    });
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
    vi.clearAllMocks();
});

it("should update application to latest minor by default", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update"]);
    expect(yoctoSpinner).toHaveBeenCalledWith({
        text: "Updating template package to latest minor version...",
    });
    expect(vi.mocked(update)).toHaveBeenCalledWith(
        expect.objectContaining({ version: "minor" }),
    );
    expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining("1.2.3"));
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(mockMessage);
});

it("should update application using explicit minor strategy", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update", "minor"]);
    expect(yoctoSpinner).toHaveBeenCalledWith({
        text: "Updating template package to latest minor version...",
    });
    expect(vi.mocked(update)).toHaveBeenCalledWith(
        expect.objectContaining({ version: "minor" }),
    );
});

it("should update application using explicit patch strategy", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update", "patch"]);
    expect(yoctoSpinner).toHaveBeenCalledWith({
        text: "Updating template package to latest patch version...",
    });
    expect(vi.mocked(update)).toHaveBeenCalledWith(
        expect.objectContaining({ version: "patch" }),
    );
});

it("should update application using explicit latest strategy", async () => {
    expect.hasAssertions();
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update", "latest"]);
    expect(yoctoSpinner).toHaveBeenCalledWith({
        text: "Updating template package to latest version...",
    });
    expect(vi.mocked(update)).toHaveBeenCalledWith(
        expect.objectContaining({ version: "latest" }),
    );
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
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(mockMessage);
});

it("should print update notice when available", async () => {
    expect.hasAssertions();
    vi.mocked(update).mockResolvedValue({
        message: mockMessage,
        resolvedVersion: "1.2.3",
        notice: "major update available",
    });
    const parser = createParser({ cwd: baseTemplate }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["update"]);
    expect(vi.mocked(console.warn)).toHaveBeenCalledWith(
        "major update available",
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(mockMessage);
});
