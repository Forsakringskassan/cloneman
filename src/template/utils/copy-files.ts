import fs from "node:fs/promises";
import path from "node:path";
import { minimatch } from "minimatch";
import spawn from "nano-spawn";

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
        const fileName = base.startsWith(".") ? base.replace(".", "_") : base;
        const fileDir = path.join(dstDir, dir);
        await fs.mkdir(fileDir, { recursive: true });
        await fs.copyFile(filePath, path.join(dstDir, dir, fileName));
    }

    const s = targetFiles.length === 1 ? "" : "s";
    console.log(
        `${targetFiles.length} file${s} copied (${ignoredFiles.length} ignored)`,
    );

    return targetFiles;
}

function isIgnored(filePath: string, patterns: string[]): boolean {
    return patterns.some((it) => minimatch(filePath, it));
}
