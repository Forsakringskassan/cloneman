import { describe, expect, it } from "vitest";
import { getApplicationSelector } from "./get-application-selector";

describe("getApplicationSelector()", () => {
    it("should return a CSS class selector for a plain name", () => {
        expect.assertions(1);
        expect(getApplicationSelector("foo")).toBe(".foo");
    });

    it("should return a CSS class selector for a scoped name", () => {
        expect.assertions(1);
        expect(getApplicationSelector("@scope/foo")).toBe(".scope--foo");
    });
});
