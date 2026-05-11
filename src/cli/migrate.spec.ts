import { afterEach, beforeEach, expect, it, vi } from "vitest";
import yoctoSpinner from "yocto-spinner";
import { migrate } from "../migrate";
import { createParser } from "./cli";

vi.mock(import("../migrate"), () => ({
    migrate: vi.fn(),
}));

const mockSuccess = vi.fn();
const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    success: mockSuccess,
} as unknown as ReturnType<typeof yoctoSpinner>;

vi.mock(import("yocto-spinner"), () => ({
    default: vi.fn(() => mockSpinner),
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

    expect(migrate).toHaveBeenCalledExactlyOnceWith({
        templatePackage: templateName,
        cwd: "./my-app",
        spinner: mockSpinner,
    });

    expect(yoctoSpinner).toHaveBeenCalledWith({
        text: `Migrating application to template "${templateName}"...`,
    });
    expect(mockSuccess).toHaveBeenCalledWith(
        `Application migrated successfully`,
    );
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(`
Now run:

  npx cloneman update latest

  to update the application to the latest version of the template.
`);
});
