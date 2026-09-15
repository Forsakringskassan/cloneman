import { describe, expect, it } from "vitest";
import { patchPartiallyManagedFile } from "./patch-partially-managed-file";

function lines(...content: string[]): string {
    return content.join("\n");
}

interface TestCase {
    name: string;
    templateContent: string;
    targetContent: string | undefined;
    expectedTargetContent: string;
}

describe("patchPartiallyManagedFile", () => {
    describe("above", () => {
        it.each([
            {
                name: "returns template when target is absent",
                templateContent: lines(
                    "template line 1",
                    "template line 2",
                    "# above",
                    "ignored line 1",
                    "ignored line 2",
                ),
                targetContent: undefined,
                expectedTargetContent: lines(
                    "template line 1",
                    "template line 2",
                    "# above",
                    "ignored line 1",
                    "ignored line 2",
                ),
            },
            {
                name: "returns template with added marker when target is absent",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: undefined,
                expectedTargetContent: lines(
                    "template line 1",
                    "template line 2",
                    "# above",
                ),
            },
            {
                name: "replaces target when target marker is absent",
                templateContent: lines(
                    "template line 1",
                    "template line 2",
                    "# above",
                    "ignored line 1",
                    "ignored line 2",
                ),
                targetContent: lines("target line 1", "target line 2"),
                expectedTargetContent: lines(
                    "template line 1",
                    "template line 2",
                    "# above",
                    "ignored line 1",
                    "ignored line 2",
                ),
            },
            {
                name: "replaces target content above marker",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: lines(
                    "old line 1",
                    "old line 2",
                    "# above",
                    "target line 1",
                    "target line 2",
                ),
                expectedTargetContent: lines(
                    "template line 1",
                    "template line 2",
                    "# above",
                    "target line 1",
                    "target line 2",
                ),
            },
            {
                name: "preserves template trailing newline when adding marker",
                templateContent: `${lines(
                    "template line 1",
                    "template line 2",
                )}\n`,
                targetContent: undefined,
                expectedTargetContent: `${lines(
                    "template line 1",
                    "template line 2",
                    "# above",
                )}\n`,
            },
            {
                name: "adds marker before all template trailing newlines",
                templateContent: `${lines(
                    "template line 1",
                    "template line 2",
                )}\n\n`,
                targetContent: undefined,
                expectedTargetContent: `${lines(
                    "template line 1",
                    "template line 2",
                    "# above",
                )}\n\n`,
            },
            {
                name: "preserves template CRLF when adding marker",
                templateContent: "template line 1\r\ntemplate line 2\r\n",
                targetContent: undefined,
                expectedTargetContent:
                    "template line 1\r\ntemplate line 2\r\n# above\r\n",
            },
            {
                name: "updates a CRLF target when marker is present",
                templateContent: "template line 1\r\ntemplate line 2",
                targetContent: "old line\r\n# above\r\ntarget line\r\n",
                expectedTargetContent:
                    "template line 1\r\ntemplate line 2\r\n# above\r\ntarget line\r\n",
            },
        ] satisfies TestCase[])(
            "$name",
            async ({
                templateContent,
                targetContent,
                expectedTargetContent,
            }) => {
                expect.assertions(1);
                await expect(
                    patchPartiallyManagedFile(
                        {
                            name: "template.txt",
                            include: { above: "# above" },
                        },
                        templateContent,
                        targetContent,
                    ),
                ).resolves.toBe(expectedTargetContent);
            },
        );
    });

    describe("below", () => {
        it.each([
            {
                name: "returns template when target is absent",
                templateContent: lines(
                    "ignored line 1",
                    "ignored line 2",
                    "# below",
                    "template line 1",
                    "template line 2",
                ),
                targetContent: undefined,
                expectedTargetContent: lines(
                    "ignored line 1",
                    "ignored line 2",
                    "# below",
                    "template line 1",
                    "template line 2",
                ),
            },
            {
                name: "returns template with added marker when target is absent",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: undefined,
                expectedTargetContent: lines(
                    "# below",
                    "template line 1",
                    "template line 2",
                ),
            },
            {
                name: "replaces target when target marker is absent",
                templateContent: lines(
                    "ignored line 1",
                    "ignored line 2",
                    "# below",
                    "template line 1",
                    "template line 2",
                ),
                targetContent: lines("target line 1", "target line 2"),
                expectedTargetContent: lines(
                    "ignored line 1",
                    "ignored line 2",
                    "# below",
                    "template line 1",
                    "template line 2",
                ),
            },
            {
                name: "replaces target content below marker",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: lines(
                    "target line 1",
                    "target line 2",
                    "# below",
                    "old line 1",
                    "old line 2",
                ),
                expectedTargetContent: lines(
                    "target line 1",
                    "target line 2",
                    "# below",
                    "template line 1",
                    "template line 2",
                ),
            },
            {
                name: "preserves target trailing newline",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: `${lines(
                    "target line 1",
                    "# below",
                    "old line 1",
                )}\n`,
                expectedTargetContent: `${lines(
                    "target line 1",
                    "# below",
                    "template line 1",
                    "template line 2",
                )}\n`,
            },
        ] satisfies TestCase[])(
            "$name",
            async ({
                templateContent,
                targetContent,
                expectedTargetContent,
            }) => {
                expect.assertions(1);
                await expect(
                    patchPartiallyManagedFile(
                        {
                            name: "template.txt",
                            include: { below: "# below" },
                        },
                        templateContent,
                        targetContent,
                    ),
                ).resolves.toBe(expectedTargetContent);
            },
        );
    });

    describe("block", () => {
        it.each([
            {
                name: "returns template when target is absent",
                templateContent: lines(
                    "ignored line 1",
                    "ignored line 2",
                    "# begin",
                    "template line 1",
                    "template line 2",
                    "# end",
                    "ignored line 1",
                    "ignored line 2",
                ),
                targetContent: undefined,
                expectedTargetContent: lines(
                    "ignored line 1",
                    "ignored line 2",
                    "# begin",
                    "template line 1",
                    "template line 2",
                    "# end",
                    "ignored line 1",
                    "ignored line 2",
                ),
            },
            {
                name: "returns template with added markers when target is absent",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: undefined,
                expectedTargetContent: lines(
                    "# begin",
                    "template line 1",
                    "template line 2",
                    "# end",
                ),
            },
            {
                name: "replaces target when markers are absent",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: lines("target line 1", "target line 2"),
                expectedTargetContent: lines(
                    "# begin",
                    "template line 1",
                    "template line 2",
                    "# end",
                ),
            },
            {
                name: "replaces target when begin marker is absent",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: lines("target line 1", "# end", "target line 2"),
                expectedTargetContent: lines(
                    "# begin",
                    "template line 1",
                    "template line 2",
                    "# end",
                ),
            },
            {
                name: "replaces target when end marker is absent",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: lines(
                    "target line 1",
                    "# begin",
                    "target line 2",
                ),
                expectedTargetContent: lines(
                    "# begin",
                    "template line 1",
                    "template line 2",
                    "# end",
                ),
            },
            {
                name: "replaces target block content",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: lines(
                    "target line 1",
                    "target line 2",
                    "# begin",
                    "old line 1",
                    "old line 2",
                    "# end",
                    "ignored line 1",
                    "ignored line 2",
                ),
                expectedTargetContent: lines(
                    "target line 1",
                    "target line 2",
                    "# begin",
                    "template line 1",
                    "template line 2",
                    "# end",
                    "ignored line 1",
                    "ignored line 2",
                ),
            },
            {
                name: "preserves target trailing newline",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: `${lines(
                    "target line 1",
                    "# begin",
                    "target line 2",
                )}\n`,
                expectedTargetContent: `${lines(
                    "# begin",
                    "template line 1",
                    "template line 2",
                    "# end",
                )}\n`,
            },
            {
                name: "preserves target trailing newline",
                templateContent: lines("template line 1", "template line 2"),
                targetContent: `${lines(
                    "target line 1",
                    "# begin",
                    "target line 2",
                )}\n`,
                expectedTargetContent: `${lines(
                    "# begin",
                    "template line 1",
                    "template line 2",
                    "# end",
                )}\n`,
            },
        ] satisfies TestCase[])(
            "$name",
            async ({
                templateContent,
                targetContent,
                expectedTargetContent,
            }) => {
                expect.assertions(1);
                await expect(
                    patchPartiallyManagedFile(
                        {
                            name: "template.txt",
                            include: {
                                block: { begin: "# begin", end: "# end" },
                            },
                        },
                        templateContent,
                        targetContent,
                    ),
                ).resolves.toBe(expectedTargetContent);
            },
        );
    });
});
