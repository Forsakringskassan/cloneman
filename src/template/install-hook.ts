import fs from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findHookScriptPath } from "../utils";

const extensionMapping = {
    ".js": ".js",
    ".cjs": ".cjs",
    ".mjs": ".mjs",
    ".ts": ".js",
    ".cts": ".cjs",
    ".mts": ".mjs",
} as const;

/**
 * Install a hook from the template cloneman folder into the target directory.
 *
 * If the hook does not exist, nothing is installed.
 *
 * @internal
 * @param hook - Hook name.
 */
export async function installHook(
    hook: string,
    options: { hooksDir: string; targetDir: string },
): Promise<void> {
    const { hooksDir, targetDir } = options;
    const scriptPath = findHookScriptPath(hook, hooksDir);
    if (!scriptPath) {
        return;
    }
    const originalContent = await fs.readFile(
        fileURLToPath(scriptPath),
        "utf8",
    );
    const strippedContent = stripTypeScriptTypes(originalContent);
    const cleanContent = strippedContent.replaceAll(
        /^import \{\s*\} from (?:"[^"]+"|'[^']+');$/gm,
        "",
    );
    const dst = path.join(targetDir, "hooks");
    const extension =
        extensionMapping[
            path.extname(scriptPath) as keyof typeof extensionMapping
        ];
    const filename = `${hook}${extension}`;
    await fs.mkdir(dst, { recursive: true });
    await fs.writeFile(path.join(dst, filename), cleanContent);
}
