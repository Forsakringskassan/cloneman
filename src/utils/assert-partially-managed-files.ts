import fs from "node:fs/promises";
import path from "node:path";
import { ManagedFileMissingError } from "../errors";
import { getStoredFileName } from "../template/utils/get-stored-file-name";
import { hasValidMarkers } from "../template/utils/has-valid-markers";
import { type PartiallyManagedFile } from "./partially-managed-file";

/**
 * Asserts that partially managed files are correctly setup.
 *
 * @internal
 */
export async function assertPartiallyManagedFiles(options: {
    files: string[];
    managedFiles: string[];
    partiallyManagedFiles: PartiallyManagedFile[];
    templateName: string;
    filesDir: string;
}): Promise<void> {
    const {
        files,
        managedFiles,
        partiallyManagedFiles,
        templateName,
        filesDir,
    } = options;

    for (const partiallyManagedFile of partiallyManagedFiles) {
        const fileExists = files.includes(partiallyManagedFile.filename);
        if (!fileExists) {
            throw new ManagedFileMissingError({
                templateName,
                file: partiallyManagedFile.filename,
            });
        }

        const isManagedFile = managedFiles.some((pattern) =>
            path.matchesGlob(partiallyManagedFile.filename, pattern),
        );
        if (isManagedFile) {
            throw new Error(
                `Partially managed file "${partiallyManagedFile.filename}" is also listed in managedFiles`,
            );
        }

        const filePath = path.join(
            filesDir,
            getStoredFileName(partiallyManagedFile.filename),
        );
        const content = await fs.readFile(filePath, "utf8");
        if (!hasValidMarkers(partiallyManagedFile, content)) {
            throw new Error(
                `Partially managed file "${partiallyManagedFile.filename}" does not contain valid matching markers`,
            );
        }
    }
}
