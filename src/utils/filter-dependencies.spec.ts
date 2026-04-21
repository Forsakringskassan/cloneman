import { describe, expect, it } from "vitest";
import { filterDependencies } from "./filter-dependencies";

describe("filterDependencies", () => {
    it("should bump template dependencies to their new versions", () => {
        expect.assertions(1);
        const appDependencies = {
            lodash: "4.17.20",
            "@scope/owned": "1.0.0",
        };
        const templateDependencies = {
            "@scope/owned": "2.0.0",
        };

        const result = filterDependencies({
            appDependencies,
            templateDependencies,
            uninstallDependencies: undefined,
            ignoredDependencies: undefined,
        });

        expect(result).toEqual({
            lodash: "4.17.20",
            "@scope/owned": "2.0.0",
        });
    });

    it("should remove dependencies that are in uninstallDependencies", () => {
        expect.assertions(1);
        const appDependencies = {
            vue: "2.0.0",
            "my-api": "4.17.20",
            jest: "2.29.1",
        };
        const templateDependencies = {
            vue: "3.0.0",
        };
        const uninstallDependencies = ["jest"];

        const result = filterDependencies({
            appDependencies,
            templateDependencies,
            uninstallDependencies,
            ignoredDependencies: undefined,
        });

        expect(result).toEqual({
            vue: "3.0.0",
            "my-api": "4.17.20",
        });
    });

    it("should remove dependencies matching a glob pattern in uninstallDependencies", () => {
        expect.assertions(1);
        const appDependencies = {
            "@jest/core": "29.0.0",
            "@jest/reporters": "29.0.0",
            "jest-circus": "29.0.0",
            vitest: "2.0.0",
        };

        const result = filterDependencies({
            appDependencies,
            templateDependencies: { vitest: "3.0.0" },
            uninstallDependencies: ["@jest/*", "jest-*"],
            ignoredDependencies: undefined,
        });

        expect(result).toEqual({
            vitest: "3.0.0",
        });
    });

    it("should not update a dependency that matches an ignored pattern", () => {
        expect.assertions(1);
        const appDependencies = {
            lodash: "4.17.20",
            "@scope/owned": "1.0.0",
        };
        const templateDependencies = {
            lodash: "5.0.0",
            "@scope/owned": "2.0.0",
        };

        const result = filterDependencies({
            appDependencies,
            templateDependencies,
            uninstallDependencies: undefined,
            ignoredDependencies: ["lodash"],
        });

        expect(result).toEqual({
            lodash: "4.17.20",
            "@scope/owned": "2.0.0",
        });
    });

    it("should not update dependencies matching a glob pattern in ignoredDependencies", () => {
        expect.assertions(1);
        const appDependencies = {
            "@scope/foo": "1.0.0",
            "@scope/bar": "1.0.0",
            other: "1.0.0",
        };
        const templateDependencies = {
            "@scope/foo": "2.0.0",
            "@scope/bar": "2.0.0",
            other: "2.0.0",
        };

        const result = filterDependencies({
            appDependencies,
            templateDependencies,
            uninstallDependencies: undefined,
            ignoredDependencies: ["@scope/*"],
        });

        expect(result).toEqual({
            "@scope/foo": "1.0.0",
            "@scope/bar": "1.0.0",
            other: "2.0.0",
        });
    });
});
