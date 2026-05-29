export function getStoredFileName(filename: string): string {
    const storedFileName = filename.startsWith(".")
        ? filename.replace(".", "_")
        : filename;
    return storedFileName;
}
