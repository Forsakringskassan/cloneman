import fs from "node:fs/promises";
import path from "node:path";
import {
    type PackageJson,
    type TemplatePackageJson,
    readJsonFile,
} from "../../utils";
import { createManagedFilesHash } from "./create-managed-files-hash";

/*
 * @internal
 */
export async function finalizeBuildTemplate(targetDir: string): Promise<void> {
    const filesDir = path.join(targetDir, "files");
    const { cloneman } = await readJsonFile<TemplatePackageJson>(
        path.join(targetDir, "package.json"),
    );
    const packageJson = await readJsonFile<PackageJson>(
        path.join(filesDir, "package.json"),
    );

    const fileHash = await createManagedFilesHash(
        filesDir,
        cloneman.managedFiles,
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
            filesDir: path.join(import.meta.dirname, "files"),
            hooksDir: path.join(import.meta.dirname, "hooks"),
        }

        export default options;
    `;

    await fs.writeFile(path.join(targetDir, "index.js"), indexJs);
}
