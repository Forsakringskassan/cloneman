import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { migrate } from "../migrate";
import { createParser } from "./cli";

vi.mock(import("../migrate"), () => ({
    migrate: vi.fn(),
}));

beforeEach(() => {
    vi.mocked(migrate).mockResolvedValue(undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(() => {
    vi.clearAllMocks();
});

it("migrate app", async () => {
    expect.hasAssertions();
    const templateName = "my-template";
    const parser = createParser({ cwd: "./my-app" }).fail((msg) => {
        expect.fail(msg);
    });
    await parser.parse(["migrate", templateName]);

    expect(migrate).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
            templatePackage: templateName,
            cwd: "./my-app",
        }),
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(`
Now run:

  npx cloneman update latest

  to update the application to the latest version of the template.
`);
});
