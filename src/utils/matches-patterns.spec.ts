import { describe, expect, it } from "vitest";
import { matchesPatterns } from "./matches-patterns";

describe("matchesPatterns", () => {
    it("should return true when key matches a positive pattern", () => {
        expect.assertions(1);
        expect(matchesPatterns("@scope/foo", ["@scope/*"])).toBe(true);
    });

    it("should return false when key does not match any positive pattern", () => {
        expect.assertions(1);
        expect(matchesPatterns("other", ["@scope/*"])).toBe(false);
    });

    it("should return false when key is excluded by a negation pattern", () => {
        expect.assertions(1);
        expect(matchesPatterns("@scope/foo", ["@scope/*", "!@scope/foo"])).toBe(
            false,
        );
    });

    it("should return true when key matches a positive pattern but not a negation pattern", () => {
        expect.assertions(1);
        expect(matchesPatterns("@scope/bar", ["@scope/*", "!@scope/foo"])).toBe(
            true,
        );
    });

    it("should return false when patterns list is empty", () => {
        expect.assertions(1);
        expect(matchesPatterns("foo", [])).toBe(false);
    });

    it("should match exact names as well as globs", () => {
        expect.assertions(1);
        expect(matchesPatterns("lodash", ["lodash"])).toBe(true);
    });
});
