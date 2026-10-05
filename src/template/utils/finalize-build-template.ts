import fs from "node:fs/promises";
import path from "node:path";
import { API_VERSION, CLONEMAN_VERSION } from "../../properties";
import {
    type PackageJson,
    type TemplatePackageJson,
    readJsonFile,
} from "../../utils";
import { createManagedFilesHash } from "./create-managed-files-hash";

/*
 * @internal
 */
export async function finalizeBuildTemplate(
    targetDir: string,
    hooksDir: string,
): Promise<void> {
    const filesDir = path.join(targetDir, "files");
    const { cloneman } = await readJsonFile<TemplatePackageJson>(
        path.join(targetDir, "package.json"),
    );
    const packageJson = await readJsonFile<PackageJson>(
        path.join(filesDir, "package.json"),
    );

    const partiallyManagedFiles: string[] = (
        cloneman.partiallyManagedFiles ?? []
    ).map((file) => file.filename);

    const fileHash = await createManagedFilesHash(
        filesDir,
        hooksDir,
        [...cloneman.managedFiles, ...partiallyManagedFiles],
        packageJson,
    );

    const indexJs = `
        import fs from "node:fs/promises";
        import path from "node:path";

        const packageJsonFile = await fs.readFile(path.join(import.meta.dirname, "package.json"), "utf8");
        const packageJson = JSON.parse(packageJsonFile);

        const options = {
            ...packageJson.cloneman,
            fileHash: "${fileHash}",
            apiVersion: ${API_VERSION},
            clonemanVersion: "${CLONEMAN_VERSION}",
            filesDir: path.join(import.meta.dirname, "files"),
            hooksDir: path.join(import.meta.dirname, "hooks"),
        }

        export default options;
    `;

    await fs.writeFile(path.join(targetDir, "index.js"), indexJs);
}
