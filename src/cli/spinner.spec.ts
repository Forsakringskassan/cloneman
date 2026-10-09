import { afterEach, describe, expect, it, vi } from "vitest";
import yoctoSpinner from "yocto-spinner";
import { createSpinner } from "./spinner";

const mockSpinner = {
    start: vi.fn(),
} as unknown as ReturnType<typeof yoctoSpinner>;

vi.mock(import("yocto-spinner"), () => ({
    default: vi.fn(() => mockSpinner),
}));

const stdoutIsTTYDescriptor = Object.getOwnPropertyDescriptor(
    process.stdout,
    "isTTY",
);

function setTTY(value: boolean): void {
    Object.defineProperty(process.stdout, "isTTY", {
        configurable: true,
        value,
    });
}

afterEach(() => {
    if (stdoutIsTTYDescriptor) {
        Object.defineProperty(process.stdout, "isTTY", stdoutIsTTYDescriptor);
    } else {
        Reflect.deleteProperty(process.stdout, "isTTY");
    }
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

describe("when stdout is a TTY", () => {
    it("should use yocto-spinner", () => {
        expect.hasAssertions();
        setTTY(true);
        const spinner = createSpinner({ text: "Loading..." });
        expect(yoctoSpinner).toHaveBeenCalledWith({ text: "Loading..." });
        expect(spinner).toBe(mockSpinner);
    });
});

describe("when stdout is not a TTY", () => {
    it("should not use yocto-spinner", () => {
        expect.hasAssertions();
        setTTY(false);
        createSpinner({ text: "Loading..." });
        expect(yoctoSpinner).not.toHaveBeenCalled();
    });

    it("should print text on start", () => {
        expect.hasAssertions();
        setTTY(false);
        const log = vi
            .spyOn(console, "log")
            .mockImplementation(() => undefined);
        createSpinner({ text: "Loading..." }).start();
        expect(log).toHaveBeenCalledExactlyOnceWith("Loading...");
    });

    it("should print new text when start is given text", () => {
        expect.hasAssertions();
        setTTY(false);
        const log = vi
            .spyOn(console, "log")
            .mockImplementation(() => undefined);
        createSpinner({ text: "Loading..." }).start("Starting...");
        expect(log).toHaveBeenCalledExactlyOnceWith("Starting...");
    });

    it("should print new text when text is changed", () => {
        expect.hasAssertions();
        setTTY(false);
        const log = vi
            .spyOn(console, "log")
            .mockImplementation(() => undefined);
        const spinner = createSpinner({ text: "Loading..." });
        spinner.text = "Installing...";
        expect(log).toHaveBeenCalledExactlyOnceWith("Installing...");
        expect(spinner.text).toBe("Installing...");
    });

    it("should print the message given to success", () => {
        expect.hasAssertions();
        setTTY(false);
        const log = vi
            .spyOn(console, "log")
            .mockImplementation(() => undefined);
        createSpinner({ text: "Loading..." }).success("Done");
        expect(log).toHaveBeenCalledExactlyOnceWith("Done");
    });

    it("should print current text on stop without message", () => {
        expect.hasAssertions();
        setTTY(false);
        const log = vi
            .spyOn(console, "log")
            .mockImplementation(() => undefined);
        createSpinner({ text: "Loading..." }).stop();
        expect(log).toHaveBeenCalledExactlyOnceWith("Loading...");
    });

    it("should return the spinner to allow chaining", () => {
        expect.hasAssertions();
        setTTY(false);
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        const spinner = createSpinner();
        expect(spinner.start()).toBe(spinner);
        expect(spinner.success()).toBe(spinner);
    });

    it("should never report as spinning", () => {
        expect.hasAssertions();
        setTTY(false);
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        const spinner = createSpinner().start();
        expect(spinner.isSpinning).toBeFalsy();
    });
});
