import { describe, expect, it } from "vitest";
import { hasValidMarkers } from "./has-valid-markers";

describe("hasValidMarkers", () => {
    const filename = "template.txt";

    it("matches an above marker", () => {
        expect.assertions(1);
        const include = { above: "# above" };
        const content = "before\n# above\nafter";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeTruthy();
    });

    it("matches an above marker when it appears within a line", () => {
        expect.assertions(1);
        const include = { above: "# above" };
        const content = "before\nkeep # above here\nafter";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeTruthy();
    });

    it("rejects a missing above marker", () => {
        expect.assertions(1);
        const include = { above: "# above" };
        const content = "before\nafter";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeFalsy();
    });

    it("rejects multiple above markers", () => {
        expect.assertions(1);
        const include = { above: "# above" };
        const content = "before\n# above\nmanaged\n# above";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeFalsy();
    });

    it("matches a below marker", () => {
        expect.assertions(1);
        const include = { below: "# below" };
        const content = "before\n# below\nafter";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeTruthy();
    });

    it("rejects a missing below marker", () => {
        expect.assertions(1);
        const include = { below: "# below" };
        const content = "before\nafter";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeFalsy();
    });

    it("matches an ordered block", () => {
        expect.assertions(1);
        const include = { block: { begin: "# begin", end: "# end" } };
        const content = "before\n# begin\nmanaged\n# end\nafter";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeTruthy();
    });

    it("matches block markers when they appear within a line", () => {
        expect.assertions(1);
        const include = { block: { begin: "# begin", end: "# end" } };
        const content =
            "before\nkeep # begin here\nmanaged\n# end after\nafter";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeTruthy();
    });

    it("matches markers separated by CRLF line endings", () => {
        expect.assertions(1);
        const include = { block: { begin: "# begin", end: "# end" } };
        const content = "# begin\r\nmanaged\r\n# end";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeTruthy();
    });

    it("rejects a block with a missing marker", () => {
        expect.assertions(1);
        const include = { block: { begin: "# begin", end: "# end" } };
        const content = "# begin\nmanaged";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeFalsy();
    });

    it("rejects a reversed block", () => {
        expect.assertions(1);
        const include = { block: { begin: "# begin", end: "# end" } };
        const content = "# end\nmanaged\n# begin";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeFalsy();
    });

    it("rejects multiple block markers", () => {
        expect.assertions(1);
        const include = { block: { begin: "# begin", end: "# end" } };
        const content = "# begin\nmanaged\n# begin\n# end";
        const result = hasValidMarkers({ filename, include }, content);

        expect(result).toBeFalsy();
    });
});
