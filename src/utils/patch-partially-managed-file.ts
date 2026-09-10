import { readFile, writeFile } from "node:fs/promises";
import { type PartiallyManagedFile } from "./package-json";

export async function patchPartiallyManagedFile(
    partial: PartiallyManagedFile,
    templateFilePath: string,
    targetFilePath: string,
): Promise<void> {
    const templateContent = await readFile(templateFilePath, "utf8");
    const templateLines = templateContent.split("\n");

    let targetFileExists = true;
    let targetLines: string[] = [];
    try {
        const targetContent = await readFile(targetFilePath, "utf8");
        targetLines = targetContent.split("\n");
    } catch {
        targetFileExists = false;
    }

    const { include } = partial;

    if ("above" in include) {
        await handleAboveCase(targetFilePath, {
            templateContent,
            templateLines,
            targetLines,
            targetFileExists,
            marker: include.above,
        });
    } else if ("below" in include) {
        await handleBelowCase(targetFilePath, {
            templateContent,
            templateLines,
            targetLines,
            targetFileExists,
            marker: include.below,
        });
    } else if ("block" in include) {
        await handleBlockCase(targetFilePath, {
            templateContent,
            templateLines,
            targetLines,
            targetFileExists,
            begin: include.block.begin,
            end: include.block.end,
        });
    }
}

async function handleAboveCase(
    targetFilePath: string,
    params: {
        templateContent: string;
        templateLines: string[];
        targetLines: string[];
        targetFileExists: boolean;
        marker: string;
    },
): Promise<void> {
    const {
        templateContent,
        templateLines,
        targetLines,
        targetFileExists,
        marker,
    } = params;

    const markerIndexInTemplate = templateLines.indexOf(marker);
    const markerIndexInTarget = targetLines.indexOf(marker);

    const contentToInsert =
        markerIndexInTemplate !== -1
            ? templateLines.slice(0, markerIndexInTemplate + 1)
            : [...templateLines, marker];

    if (!targetFileExists) {
        await writeFile(
            targetFilePath,
            markerIndexInTemplate === -1
                ? contentToInsert.join("\n")
                : templateContent,
            "utf8",
        );
    } else if (markerIndexInTarget !== -1) {
        const newContent = [
            ...contentToInsert,
            ...targetLines.slice(markerIndexInTarget + 1),
        ];
        await writeFile(targetFilePath, newContent.join("\n"), "utf8");
    } else {
        const newContent = [...contentToInsert, ...targetLines];
        await writeFile(targetFilePath, newContent.join("\n"), "utf8");
    }
}

async function handleBelowCase(
    targetFilePath: string,
    params: {
        templateContent: string;
        templateLines: string[];
        targetLines: string[];
        targetFileExists: boolean;
        marker: string;
    },
): Promise<void> {
    const {
        templateContent,
        templateLines,
        targetLines,
        targetFileExists,
        marker,
    } = params;

    const markerIndexInTemplate = templateLines.indexOf(marker);
    const markerIndexInTarget = targetLines.indexOf(marker);

    const templateContentToInsert =
        markerIndexInTemplate !== -1
            ? templateLines.slice(markerIndexInTemplate + 1)
            : [...templateLines];

    if (!targetFileExists) {
        await writeFile(
            targetFilePath,
            markerIndexInTemplate === -1
                ? [marker, ...templateContentToInsert].join("\n")
                : templateContent,
            "utf8",
        );
    } else if (markerIndexInTarget !== -1) {
        const newContent = [
            ...targetLines.slice(0, markerIndexInTarget),
            marker,
            ...templateContentToInsert,
        ];
        await writeFile(targetFilePath, newContent.join("\n"), "utf8");
    } else {
        const newContent = [...targetLines, marker, ...templateContentToInsert];
        await writeFile(targetFilePath, newContent.join("\n"), "utf8");
    }
}

async function handleBlockCase(
    targetFilePath: string,
    params: {
        templateContent: string;
        templateLines: string[];
        targetLines: string[];
        targetFileExists: boolean;
        begin: string;
        end: string;
    },
): Promise<void> {
    const {
        templateContent,
        templateLines,
        targetLines,
        targetFileExists,
        begin,
        end,
    } = params;

    const beginIndexInTemplate = templateLines.indexOf(begin);
    const endIndexInTemplate = templateLines.indexOf(end);
    const beginIndexInTarget = targetLines.indexOf(begin);
    const endIndexInTarget = targetLines.indexOf(end);

    const contentToInsert = getBlockContentToInsert(
        templateLines,
        beginIndexInTemplate,
        endIndexInTemplate,
        begin,
        end,
    );

    if (!targetFileExists) {
        await writeBlockContentWhenTargetDoesNotExist(targetFilePath, {
            templateContent,
            templateLines,
            beginIndexInTemplate,
            endIndexInTemplate,
            begin,
            end,
        });
    } else if (beginIndexInTarget !== -1 && endIndexInTarget !== -1) {
        const newContent = [
            ...targetLines.slice(0, beginIndexInTarget + 1),
            ...contentToInsert.slice(1, -1),
            targetLines[endIndexInTarget],
            ...targetLines.slice(endIndexInTarget + 1),
        ];
        await writeFile(targetFilePath, newContent.join("\n"), "utf8");
    } else if (beginIndexInTarget !== -1) {
        const newContent = [
            ...targetLines.slice(0, beginIndexInTarget + 1),
            ...contentToInsert.slice(1),
        ];
        await writeFile(targetFilePath, newContent.join("\n"), "utf8");
    } else if (endIndexInTarget !== -1) {
        const newContent = [
            ...contentToInsert.slice(0, -1),
            ...targetLines.slice(endIndexInTarget),
        ];
        await writeFile(targetFilePath, newContent.join("\n"), "utf8");
    } else {
        const newContent = [...contentToInsert, ...targetLines];
        await writeFile(targetFilePath, newContent.join("\n"), "utf8");
    }
}

async function writeBlockContentWhenTargetDoesNotExist(
    targetFilePath: string,
    params: {
        templateContent: string;
        templateLines: string[];
        beginIndexInTemplate: number;
        endIndexInTemplate: number;
        begin: string;
        end: string;
    },
): Promise<void> {
    const {
        templateContent,
        templateLines,
        beginIndexInTemplate,
        endIndexInTemplate,
        begin,
        end,
    } = params;

    if (beginIndexInTemplate !== -1 && endIndexInTemplate !== -1) {
        await writeFile(targetFilePath, templateContent, "utf8");
        return;
    }

    if (beginIndexInTemplate !== -1) {
        const contentWithEndMarker = [...templateLines, end];
        await writeFile(
            targetFilePath,
            contentWithEndMarker.join("\n"),
            "utf8",
        );
        return;
    }

    if (endIndexInTemplate !== -1) {
        const contentWithBeginMarker = [begin, ...templateLines];
        await writeFile(
            targetFilePath,
            contentWithBeginMarker.join("\n"),
            "utf8",
        );
        return;
    }

    const contentWithBothMarkers = [begin, ...templateLines, end];
    await writeFile(targetFilePath, contentWithBothMarkers.join("\n"), "utf8");
}

function getBlockContentToInsert(
    templateLines: string[],
    beginIndexInTemplate: number,
    endIndexInTemplate: number,
    begin: string,
    end: string,
): string[] {
    if (beginIndexInTemplate !== -1 && endIndexInTemplate !== -1) {
        return [
            templateLines[beginIndexInTemplate],
            ...templateLines.slice(
                beginIndexInTemplate + 1,
                endIndexInTemplate,
            ),
            templateLines[endIndexInTemplate],
        ];
    }
    if (beginIndexInTemplate !== -1) {
        return [
            templateLines[beginIndexInTemplate],
            ...templateLines.slice(beginIndexInTemplate + 1),
        ];
    }
    if (endIndexInTemplate !== -1) {
        return [
            ...templateLines.slice(0, endIndexInTemplate),
            templateLines[endIndexInTemplate],
        ];
    }
    return [begin, ...templateLines, end];
}
