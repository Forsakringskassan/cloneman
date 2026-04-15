import path from "node:path";
import { buildResolver } from "esm-resolve";

/**
 * @internal
 */
export interface TemplateInfo {
    readonly filesDir: string;
    readonly boilerplateFiles: string[];
    readonly managedFiles: string[];
}

interface TemplateInfoModule {
    default: TemplateInfo;
}

/**
 * @internal
 */
export async function getTemplateInfo(
    templatePackage: string,
    appPath: string,
): Promise<TemplateInfo> {
    const resolver = buildResolver(path.posix.join(appPath, "noop.js"));
    const resolved = resolver(templatePackage);
    if (!resolved) {
        throw new Error(
            `Package ${templatePackage} is not a valid cloneman template package`,
        );
    }
    const absolute = path.join(appPath, resolved);
    const { default: info } = (await import(absolute)) as TemplateInfoModule;
    return info;
}
