import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { withTemporaryDirectory } from "./temporary-directory";

const rootDir = path.resolve(import.meta.dirname, "../..");
const fixtureDir = path.resolve(rootDir, "fixtures");

/**
 * Returns true if the filePath is or is inside `node_modules/`.
 */
function insideNodeModules(filePath: string): boolean {
    return path.matchesGlob(filePath, "**/node_modules/**");
}

/**
 * Copies a fixture to a temporary directory and run callback.
 *
 *   - `cloneman` package is symlinked to project directory
 *   - fixture files staged and committed to git
 *
 * The directory is cleaned up automatically. For use with tests only.
 *
 * @example
 *
 * ```ts
 * it("should do something useful", async () => {
 *   expect.assertions(1);
 *   await withFixture("base-template@1.0.0", async (fixture) => {
 *     const result = await doSomething(fixture);
 *     expect(result).toBe("awesome");
 *   });
 * });
 * ```
 *
 * @internal
 * @param fixture - Name of fixture (in the `fixtures/` folder).
 * @param cb - Callback to run with the temporary fixture path.
 */
export async function withFixture(
    fixture: string,
    cb: (dir: string) => void | Promise<void>,
): Promise<void> {
    const src = path.join(fixtureDir, fixture);
    await withTemporaryDirectory(async (dst) => {
        const nodeModules = path.join(dst, "node_modules");
        await fs.cp(src, dst, {
            recursive: true,
            filter(source) {
                const filePath = path.relative(src, source);
                if (insideNodeModules(filePath)) {
                    return false;
                }
                return true;
            },
        });
        await spawn("git", ["-C", dst, "init"]);
        await spawn("git", ["-C", dst, "add", "."]);
        await spawn("git", ["-C", dst, "commit", "-m", "initial commit"], {
            env: {
                GIT_AUTHOR_NAME: "Test",
                GIT_AUTHOR_EMAIL: "test@example.com",
                GIT_COMMITTER_NAME: "Test",
                GIT_COMMITTER_EMAIL: "test@example.com",
            },
        });

        await fs.mkdir(nodeModules, { recursive: true });
        await fs.symlink(
            rootDir,
            path.join(nodeModules, "cloneman"),
            "junction",
        );
        await cb(dst);
    });
}
