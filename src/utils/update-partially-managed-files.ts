import fs from "node:fs/promises";
import path from "node:path";
import { getStoredFileName } from "../template/utils/get-stored-file-name";
import { patchPartiallyManagedFile } from "../template/utils/patch-partially-managed-file";
import type { TemplatePackageJson } from "./package-json";

/**
 * @internal
 */
export async function updatePartiallyManagedFiles(
    files: Map<string, Buffer>,
    cloneman: Partial<TemplatePackageJson["cloneman"]>,
    { cwd }: { cwd: string },
): Promise<void> {
    const { partiallyManagedFiles } = cloneman;
    if (!partiallyManagedFiles) {
        return;
    }

    await Promise.all(
        partiallyManagedFiles.map(async (partial) => {
            const tarEntryPath = `package/files/${getStoredFileName(partial.filename)}`;
            const tarContent = files.get(tarEntryPath);
            if (tarContent === undefined) {
                throw new Error(
                    `Managed file "${partial.filename}" not found in tarball`,
                );
            }

            const destPath = path.join(cwd, partial.filename);
            let destContent: string;
            try {
                destContent = await fs.readFile(destPath, "utf8");
            } catch {
                await fs.writeFile(destPath, tarContent, { encoding: "utf8" });
                return;
            }

            const patchedContent = patchPartiallyManagedFile(
                partial,
                tarContent.toString("utf8"),
                destContent,
            );
            await fs.writeFile(destPath, patchedContent, { encoding: "utf8" });
        }),
    );
}
