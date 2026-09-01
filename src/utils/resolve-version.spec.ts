import { beforeEach, describe, expect, it, vi } from "vitest";
import { info } from "./npm";
import { resolveVersion } from "./resolve-version";

vi.mock(import("./npm"), () => ({
    info: vi.fn(),
}));

describe("resolveVersion", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should resolve latest target", async () => {
        expect.assertions(2);
        vi.mocked(info).mockResolvedValueOnce("1.2.3");

        const result = await resolveVersion({
            template: "@forsakringskassan/base-template",
            currentVersion: "1.0.0",
            target: "latest",
            env: {},
        });

        expect(result).toEqual({ resolvedVersion: "1.2.3" });
        expect(vi.mocked(info)).toHaveBeenCalledWith(
            "@forsakringskassan/base-template@latest",
            {
                field: "version",
                env: {},
            },
        );
    });

    it("should resolve latest minor and include major-update notice", async () => {
        expect.assertions(2);
        vi.mocked(info)
            .mockResolvedValueOnce(["1.0.0", "1.0.1", "1.1.0", "2.0.0"])
            .mockResolvedValueOnce("2.0.0");

        const result = await resolveVersion({
            template: "@forsakringskassan/base-template",
            currentVersion: "1.0.0",
            target: "minor",
            env: {},
        });

        expect(result).toEqual({
            resolvedVersion: "1.1.0",
            notice: 'A new template version is available (2.0.0). Run "cloneman update latest" to upgrade.',
        });
        expect(vi.mocked(info)).toHaveBeenNthCalledWith(
            1,
            "@forsakringskassan/base-template",
            {
                field: "versions",
                env: {},
            },
        );
    });

    it("should resolve latest patch without major-update notice", async () => {
        expect.assertions(1);
        vi.mocked(info)
            .mockResolvedValueOnce(["1.2.0", "1.2.1", "1.3.0"])
            .mockResolvedValueOnce("1.3.0");

        const result = await resolveVersion({
            template: "@forsakringskassan/base-template",
            currentVersion: "1.2.0",
            target: "patch",
            env: {},
        });

        expect(result).toEqual({ resolvedVersion: "1.2.1" });
    });

    it("should throw when no version satisfies target range", async () => {
        expect.assertions(1);
        vi.mocked(info).mockResolvedValueOnce(["2.0.0"]);

        await expect(
            resolveVersion({
                template: "@forsakringskassan/base-template",
                currentVersion: "1.0.0",
                target: "minor",
                env: {},
            }),
        ).rejects.toThrow(
            'Could not resolve minor update for template "@forsakringskassan/base-template" from 1.0.0',
        );
    });
});
