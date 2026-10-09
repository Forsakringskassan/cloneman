import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { create } from "../create";
import { createParser } from "./cli";

vi.mock(import("../create"), () => ({
    create: vi.fn(),
}));

const mockMessage = "lorem ipsum";

beforeEach(() => {
    vi.mocked(create).mockResolvedValue({
        message: mockMessage,
    });
    vi.spyOn(console, "log").mockImplementation(() => undefined);
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

    expect(create).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
            name: appName,
            output: "",
            templatePackage: templateName,
            cwd: "./new-app",
            parameters: new Map(),
        }),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(mockMessage);
});
