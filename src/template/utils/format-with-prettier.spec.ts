import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFormat, mockReadFile, mockResolveConfig, mockWriteFile } =
    vi.hoisted(() => ({
        mockFormat: vi.fn(),
        mockReadFile: vi.fn(),
        mockResolveConfig: vi.fn(),
        mockWriteFile: vi.fn(),
    }));

vi.mock(import("node:fs/promises"), () => ({
    readFile: mockReadFile,
    writeFile: mockWriteFile,
}));

vi.mock(import("prettier"), () => ({
    format: mockFormat,
    resolveConfig: mockResolveConfig,
}));

import { formatWithPrettier } from "./format-with-prettier";

describe("formatWithPrettier()", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mockReadFile.mockResolvedValue("source");
        mockResolveConfig.mockResolvedValue({ semi: false });
        mockFormat.mockResolvedValue("formatted source");
        mockWriteFile.mockResolvedValue(undefined);
    });

    it("should call prettier and write the formatted source", async () => {
        expect.assertions(2);
        const filePath = "/template/files/example.ts";

        await formatWithPrettier(filePath);

        expect(mockFormat).toHaveBeenCalledWith("source", {
            semi: false,
            filepath: filePath,
        });
        expect(mockWriteFile).toHaveBeenCalledWith(
            filePath,
            "formatted source",
            "utf8",
        );
    });

    it("should silently skip formatting if prettier is not available", async () => {
        expect.assertions(2);
        vi.doMock(import("prettier"), () => {
            throw new Error("Cannot find package 'prettier'");
        });
        vi.resetModules();

        const { formatWithPrettier: formatWithoutPrettier } =
            await import("./format-with-prettier");

        await expect(
            formatWithoutPrettier("/template/files/example.ts"),
        ).resolves.toBeUndefined();
        expect(mockReadFile).not.toHaveBeenCalled();
    });
});
