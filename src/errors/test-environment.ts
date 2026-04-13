import prettyAnsi from "pretty-ansi";
import { expect, vi } from "vitest";

vi.mock(import("node:util"), async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        styleText(format, text, options) {
            return original.styleText(format, text, {
                ...options,
                validateStream: false,
            });
        },
    };
});

expect.addSnapshotSerializer({
    test(val) {
        return typeof val === "string";
    },
    serialize(text) {
        return prettyAnsi(String(text));
    },
});
