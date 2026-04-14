import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { getStoredFileName } from "./get-stored-filename";
import { isIgnored } from "./is-ignored";

const protectedFiles = ["**/.npmrc"];

export async function copyFiles(
    dstDir: string,
    ignoredPatterns: string[],
): Promise<string[]> {
    const { output } = await spawn("git", ["ls-files"]);
    const filePaths = output.split("\n");

    const ignoredFiles = filePaths.filter((it) =>
        isIgnored(it, ignoredPatterns),
    );
    const targetFiles = filePaths.filter(
        (it) => !isIgnored(it, ignoredPatterns),
    );

    // kan förbättras med promise all
    for (const filePath of filePaths) {
        if (isIgnored(filePath, ignoredFiles)) {
            continue;
        }
        const { dir, base } = path.parse(filePath);
        const fileName = getStoredFileName(base);
        const fileDir = path.join(dstDir, dir);
        await fs.mkdir(fileDir, { recursive: true });
        const dst = path.join(dstDir, dir, fileName);
        if (
            protectedFiles.some((pattern) =>
                path.matchesGlob(filePath, pattern),
            )
        ) {
            const { output } = await spawn("git", [
                "show",
                `HEAD:./${filePath}`,
            ]);
            await fs.writeFile(dst, output);
            continue;
        }
        await fs.copyFile(filePath, dst);
    }

    const s = targetFiles.length === 1 ? "" : "s";
    console.log(
        `${targetFiles.length} file${s} copied (${ignoredFiles.length} ignored)`,
    );

    return targetFiles;
}
