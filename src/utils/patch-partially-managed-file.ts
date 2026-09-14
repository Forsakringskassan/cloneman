import { type PartiallyManagedFile } from "./package-json";

/**
 * Patches a partially managed file with the managed content from a template.
 *
 * @internal
 */
export function patchPartiallyManagedFile(
    partial: PartiallyManagedFile,
    templateContent: string,
    targetContent?: string,
): Promise<string> {
    const templateLineEnding = getLineEnding(templateContent);
    const templateTrailingNewlines = getTrailingNewlines(templateContent);
    const templateContentWithoutTrailingNewlines = templateContent.slice(
        0,
        templateContent.length - templateTrailingNewlines.length,
    );
    const templateLines = splitLines(templateContentWithoutTrailingNewlines);
    const managedLines = getManagedLines(partial, templateLines);

    if (targetContent === undefined) {
        return Promise.resolve(
            replaceTrailingNewlines(
                ensureMarkers(partial, templateLines).join(templateLineEnding),
                templateTrailingNewlines,
            ),
        );
    }

    const targetLineEnding = getLineEnding(targetContent);
    const targetLines = splitLines(targetContent);
    const targetTrailingNewlines = getTrailingNewlines(targetContent);

    if (!hasValidMarkers(partial, targetLines)) {
        return Promise.resolve(
            replaceTrailingNewlines(
                ensureMarkers(partial, templateLines).join(templateLineEnding),
                targetTrailingNewlines,
            ),
        );
    }

    const range = getManagedRange(partial, targetLines);
    return Promise.resolve(
        replaceTrailingNewlines(
            replaceRange(targetLines, range, managedLines).join(
                targetLineEnding,
            ),
            targetTrailingNewlines,
        ),
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

function hasValidMarkers(
    partial: PartiallyManagedFile,
    targetLines: string[],
): boolean {
    const { include } = partial;

    if ("above" in include) {
        return targetLines.includes(include.above);
    }

    if ("below" in include) {
        return targetLines.includes(include.below);
    }

    return (
        targetLines.includes(include.block.begin) &&
        targetLines.includes(include.block.end)
    );
}

function getManagedLines(
    partial: PartiallyManagedFile,
    templateLines: string[],
): string[] {
    const { include } = partial;

    if ("above" in include) {
        const markerIndex = templateLines.indexOf(include.above);
        return markerIndex === -1
            ? [...templateLines, include.above]
            : templateLines.slice(0, markerIndex + 1);
    }

    if ("below" in include) {
        const markerIndex = templateLines.indexOf(include.below);
        return markerIndex === -1
            ? [include.below, ...templateLines]
            : templateLines.slice(markerIndex);
    }

    const { begin, end } = include.block;
    const beginIndex = templateLines.indexOf(begin);
    const endIndex = templateLines.indexOf(end);

    return [
        begin,
        ...templateLines.slice(
            beginIndex === -1 ? 0 : beginIndex + 1,
            endIndex === -1 ? undefined : endIndex,
        ),
        end,
    ];
}

function ensureMarkers(
    partial: PartiallyManagedFile,
    templateLines: string[],
): string[] {
    const { include } = partial;

    if ("above" in include) {
        return templateLines.includes(include.above)
            ? templateLines
            : [...templateLines, include.above];
    }

    if ("below" in include) {
        return templateLines.includes(include.below)
            ? templateLines
            : [include.below, ...templateLines];
    }

    const { begin, end } = include.block;
    const lines = templateLines.includes(begin)
        ? templateLines
        : [begin, ...templateLines];
    return lines.includes(end) ? lines : [...lines, end];
}

function getManagedRange(
    partial: PartiallyManagedFile,
    targetLines: string[],
): { start: number; end: number } {
    const { include } = partial;

    if ("above" in include) {
        return { start: 0, end: targetLines.indexOf(include.above) };
    }

    if ("below" in include) {
        return {
            start: targetLines.indexOf(include.below),
            end: targetLines.length - 1,
        };
    }

    const beginIndex = targetLines.indexOf(include.block.begin);
    const endIndex = targetLines.indexOf(include.block.end);

    let end = endIndex;
    if (beginIndex !== -1 && endIndex === -1) {
        end = targetLines.length - 1;
    }

    return {
        start: endIndex !== -1 && beginIndex === -1 ? 0 : beginIndex,
        end,
    };
}

function replaceRange(
    lines: string[],
    range: { start: number; end: number },
    replacement: string[],
): string[] {
    if (range.start === -1 && range.end === -1) {
        return [...replacement, ...lines];
    }

    if (range.start === -1) {
        return [...lines, ...replacement];
    }

    return [
        ...lines.slice(0, range.start),
        ...replacement,
        ...lines.slice(range.end + 1),
    ];
}
