import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { getStoredFileName } from "./get-stored-file-name";

function isIgnored(key: string, ignored: string[]): boolean {
    return ignored.some((pattern) => path.matchesGlob(key, pattern));
}

const protectedFiles = ["**/.npmrc"];

export async function copyFiles(
    logger: Console,
    templateDir: string,
    dstDir: string,
    ignoredPatterns: string[],
): Promise<string[]> {
    const { output } = await spawn("git", ["ls-files"], { cwd: templateDir });
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
        if (isIgnored(filePath, protectedFiles)) {
            const { output } = await spawn(
                "git",
                ["show", `HEAD:./${filePath}`],
                { cwd: templateDir },
            );
            await fs.writeFile(dst, output);
            continue;
        }
        const src = path.join(templateDir, filePath);
        await fs.copyFile(src, dst);
    }

    const s = targetFiles.length === 1 ? "" : "s";
    logger.log(
        `${targetFiles.length} file${s} copied (${ignoredFiles.length} ignored)`,
    );

    return targetFiles;
}
