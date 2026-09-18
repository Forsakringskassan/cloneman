import { type PartiallyManagedFile } from "../../utils";

/**
 * Checks whether a file contains the markers declared for a partially managed
 * file.
 *
 * @internal
 */
export function hasValidMarkers(
    partiallyManagedFile: PartiallyManagedFile,
    content: string,
): boolean {
    const lines = content.split(/\r\n|\n|\r/);
    const { include } = partiallyManagedFile;

    if ("above" in include) {
        return findMarkerLineIndices(lines, include.above).length === 1;
    }

    if ("below" in include) {
        return findMarkerLineIndices(lines, include.below).length === 1;
    }

    const beginIndices = findMarkerLineIndices(lines, include.block.begin);
    const endIndices = findMarkerLineIndices(lines, include.block.end);
    return (
        beginIndices.length === 1 &&
        endIndices.length === 1 &&
        beginIndices[0] < endIndices[0]
    );
}

function findMarkerLineIndices(lines: string[], marker: string): number[] {
    return lines.reduce<number[]>((indices, line, index) => {
        if (line.includes(marker)) {
            indices.push(index);
        }
        return indices;
    }, []);
}
