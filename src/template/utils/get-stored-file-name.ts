/**
 * @internal
 * @param filePath - The file path to transform.
 * @returns - Transformed file path segments with leading dot replaced by underscores
 */
export function getStoredFileName(filePath: string): string {
    const renamedDir = filePath
        .split("/")
        .map((part) => replaceDot(part))
        .join("/");

    return renamedDir;
}

function replaceDot(filename: string): string {
    const storedFileName = filename.startsWith(".")
        ? filename.replace(".", "_")
        : filename;
    return storedFileName;
}
