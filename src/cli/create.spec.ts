import { afterEach, beforeEach, expect, it, vi } from "vitest";
import yoctoSpinner from "yocto-spinner";
import { create } from "../create";
import { createParser } from "./cli";

vi.mock(import("../create"), () => ({
    create: vi.fn(),
}));

const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    success: vi.fn(),
} as unknown as ReturnType<typeof yoctoSpinner>;

vi.mock(import("yocto-spinner"), () => ({
    default: vi.fn(() => mockSpinner),
}));

beforeEach(() => {
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
        spinner: mockSpinner,
    });

    expect(yoctoSpinner).toHaveBeenCalledWith({
        text: `Creating application "${appName}" with template "${templateName}"...`,
    });
});
