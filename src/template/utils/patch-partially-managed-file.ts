import { type PartiallyManagedFile } from "../../utils";
import { hasValidMarkers } from "./has-valid-markers";

/**
 * Patches a partially managed file with the managed content from a template.
 *
 * @internal
 */
export function patchPartiallyManagedFile(
    partial: PartiallyManagedFile,
    templateContent: string,
    targetContent?: string,
): string {
    if (targetContent === undefined) {
        return templateContent;
    }

    if (!hasValidMarkers(partial, targetContent)) {
        return templateContent;
    }

    const templateLines = splitLines(
        templateContent.slice(
            0,
            templateContent.length -
                getTrailingNewlines(templateContent).length,
        ),
    );
    const templateManagedRange = getManagedRange(partial, templateLines);
    const templateManagedLines = templateLines.slice(
        templateManagedRange.start,
        templateManagedRange.end + 1,
    );

    const targetLines = splitLines(targetContent);
    const targetLineEnding = getLineEnding(targetContent);
    const targetTrailingNewlines = getTrailingNewlines(targetContent);
    const targetManagedRange = getManagedRange(partial, targetLines);

    return replaceTrailingNewlines(
        [
            ...targetLines.slice(0, targetManagedRange.start),
            ...templateManagedLines,
            ...targetLines.slice(targetManagedRange.end + 1),
        ].join(targetLineEnding),
        targetTrailingNewlines,
    );
}

function getLineEnding(content: string): string {
    return /\r\n|\n|\r/.exec(content)?.[0] ?? "\n";
}

function splitLines(content: string): string[] {
    return content.split(/\r\n|\n|\r/);
}

function getTrailingNewlines(content: string): string {
    return /(?:\r\n|\n)+$/.exec(content)?.[0] ?? "";
}

function replaceTrailingNewlines(
    content: string,
    trailingNewlines: string,
): string {
    return content.replace(/(?:\r\n|\n)*$/, "") + trailingNewlines;
}

function getManagedRange(
    partial: PartiallyManagedFile,
    lines: string[],
): { start: number; end: number } {
    const { include } = partial;

    if ("above" in include) {
        const markerIndex = findMarkerLineIndex(lines, include.above);
        return { start: 0, end: markerIndex - 1 };
    }

    if ("below" in include) {
        const markerIndex = findMarkerLineIndex(lines, include.below);
        return {
            start: markerIndex + 1,
            end: lines.length - 1,
        };
    }

    const beginIndex = findMarkerLineIndex(lines, include.block.begin);
    const endIndex = findMarkerLineIndex(lines, include.block.end);
    return {
        start: beginIndex + 1,
        end: endIndex - 1,
    };
}

function findMarkerLineIndex(lines: string[], marker: string): number {
    return lines.findIndex((line) => line.includes(marker));
}
