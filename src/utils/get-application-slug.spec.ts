import { describe, expect, it } from "vitest";
import { getApplicationSlug } from "./get-application-slug";

describe("getApplicationSlug()", () => {
    it("should return plain name unchanged", () => {
        expect.assertions(1);
        expect(getApplicationSlug("foo")).toBe("foo");
    });

    it("should convert scoped name to slug", () => {
        expect.assertions(1);
        expect(getApplicationSlug("@scope/foo")).toBe("scope--foo");
    });

    it("should lowercase the name", () => {
        expect.assertions(1);
        expect(getApplicationSlug("MyApp")).toBe("myapp");
    });

    it("should lowercase a scoped name", () => {
        expect.assertions(1);
        expect(getApplicationSlug("@MyOrg/MyApp")).toBe("myorg--myapp");
    });

    it("should remove non-alphanumeric characters except hyphens and underscores", () => {
        expect.assertions(1);
        expect(getApplicationSlug("my.app!name")).toBe("myappname");
    });

    it("should preserve hyphens and underscores", () => {
        expect.assertions(1);
        expect(getApplicationSlug("my-app_name")).toBe("my-app_name");
    });
});
