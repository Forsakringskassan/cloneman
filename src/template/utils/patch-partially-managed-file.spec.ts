import { describe, expect, it } from "vitest";
import { patchPartiallyManagedFile } from "./patch-partially-managed-file";

function lines(...content: string[]): string {
    return content.join("\n");
}

describe("patchPartiallyManagedFile", () => {
    it("patches a valid target with an above marker", () => {
        expect.assertions(1);
        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { above: "# above" },
                },
                lines("template line", "# above", "ignored"),
                lines("old", "# above", "target"),
            ),
        ).toBe(lines("template line", "# above", "target"));
    });

    it("patches a valid target with a below marker", () => {
        expect.assertions(1);
        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { below: "# below" },
                },
                lines("ignored", "# below", "template line"),
                lines("target", "# below", "old"),
            ),
        ).toBe(lines("target", "# below", "template line"));
    });

    it("patches a valid target with a block", () => {
        expect.assertions(1);
        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { block: { begin: "# begin", end: "# end" } },
                },
                lines("ignored", "# begin", "template", "# end", "ignored"),
                lines("target", "# begin", "old", "# end", "ignored"),
            ),
        ).toBe(lines("target", "# begin", "template", "# end", "ignored"));
    });

    it("keeps the target line where the marker appears within a line", () => {
        expect.assertions(1);
        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { above: "# above" },
                },
                lines("template line", "# above", "ignored"),
                lines("before", "keep # above here", "target"),
            ),
        ).toBe(lines("template line", "keep # above here", "target"));
    });

    it("copies the template when the above target marker is missing", () => {
        expect.assertions(1);
        const templateContent = lines("template line", "# above");

        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { above: "# above" },
                },
                templateContent,
            ),
        ).toBe(templateContent);
    });

    it("copies the template when the below target marker is missing", () => {
        expect.assertions(1);
        const templateContent = lines("# below", "template line");

        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { below: "# below" },
                },
                templateContent,
            ),
        ).toBe(templateContent);
    });

    it("copies the template when the block target is missing", () => {
        expect.assertions(1);
        const templateContent = lines("# begin", "template", "# end");

        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { block: { begin: "# begin", end: "# end" } },
                },
                templateContent,
            ),
        ).toBe(templateContent);
    });

    it("copies the template when the above target marker is invalid", () => {
        expect.assertions(1);
        const templateContent = lines("template line", "# above");

        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { above: "# above" },
                },
                templateContent,
                lines("target without marker"),
            ),
        ).toBe(templateContent);
    });

    it("copies the template when the below target marker is invalid", () => {
        expect.assertions(1);
        const templateContent = lines("# below", "template line");

        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { below: "# below" },
                },
                templateContent,
                lines("target without marker"),
            ),
        ).toBe(templateContent);
    });

    it("copies the template when the block target marker is invalid", () => {
        expect.assertions(1);
        const templateContent = lines("# begin", "template", "# end");

        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { block: { begin: "# begin", end: "# end" } },
                },
                templateContent,
                lines("target", "# begin", "missing end"),
            ),
        ).toBe(templateContent);
    });

    it("preserves target line endings and trailing newline when patching", () => {
        expect.assertions(1);
        const templateContent = lines("template line", "# above");
        const targetContent = "old\r\n# above\r\ntarget\r\n";

        expect(
            patchPartiallyManagedFile(
                {
                    filename: "template.txt",
                    include: { above: "# above" },
                },
                templateContent,
                targetContent,
            ),
        ).toBe("template line\r\n# above\r\ntarget\r\n");
    });
});
