import { describe, expect, it } from "vitest";
import { getApplicationName } from "./get-application-name";

describe("getApplicationName()", () => {
    it("should return full name", () => {
        expect.assertions(2);
        const plain = getApplicationName("my-app", {
            unscoped: false,
        });
        const scoped = getApplicationName("@my-org/my-app", {
            unscoped: false,
        });
        expect(plain).toBe("my-app");
        expect(scoped).toBe("@my-org/my-app");
    });

    it("should return unscoped name", () => {
        expect.assertions(2);
        const plain = getApplicationName("my-app", {
            unscoped: true,
        });
        const scoped = getApplicationName("@my-org/my-app", {
            unscoped: true,
        });
        expect(plain).toBe("my-app");
        expect(scoped).toBe("my-app");
    });
});
