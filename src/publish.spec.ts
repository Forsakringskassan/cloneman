import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    inject,
    it,
    vi,
} from "vitest";
import { prepare } from "./prepare";
import { publish } from "./publish";
import { rmDir } from "./test-utils/rm-dir";
import { temporaryDirectory } from "./test-utils/temporary-directory";
import { info } from "./utils";

/*
Increased timeout time since test involves a lot reading and writing to disc.
Npm publish also takes some time on Windows machines, which causes the test to fail with timeout error.
*/
vi.setConfig({ testTimeout: 30000 });

const targetDir = temporaryDirectory();
const authEnv = inject("authEnv");
const npmrc = inject("npmrc");

async function writeNpmRc(dst: string): Promise<void> {
    const filePath = path.join(dst, ".npmrc");
    await fs.writeFile(filePath, npmrc);
}

beforeAll(async () => {
    await fs.mkdir(targetDir, { recursive: true });
});

afterAll(async () => {
    await rmDir(targetDir);
});

it("should publish template", async () => {
    expect.assertions(1);

    await writeNpmRc(targetDir);

    // Verify that the package is not already published before the test, to avoid false positives
    try {
        await spawn(
            "npm",
            [
                "unpublish",
                "@forsakringskassan/publish-template@1.0.0",
                "--force",
            ],
            {
                cwd: targetDir,
                env: authEnv,
            },
        );
    } catch {
        // ignore error if package is not found
    }

    const fixtureDir = path.resolve(import.meta.dirname, "../fixtures");
    const baseTemplate = path.join(fixtureDir, "publish-template");

    await prepare(baseTemplate, targetDir);
    await writeNpmRc(targetDir);
    await publish({ cwd: targetDir, env: authEnv });

    const output = await info("@forsakringskassan/publish-template", {
        env: authEnv,
    });
    expect(output).toEqual(
        expect.objectContaining({
            cloneman: {
                boilerplateFiles: ["boilerplate.txt", "managed.txt"],
                managedFiles: ["managed.txt"],
                uninstallDependencies: [],
            },
            name: "@forsakringskassan/publish-template",
            version: "1.0.0",
            versions: ["1.0.0"],
        }),
    );
});

describe("publish options", () => {
    let spawnSpy = vi.fn();
    let localPublish: typeof publish;

    beforeEach(async () => {
        vi.resetModules();
        spawnSpy = vi.fn();

        vi.doMock(import("nano-spawn"), () => ({
            default: spawnSpy,
        }));

        ({ publish: localPublish } = await import("./publish"));
    });

    afterEach(() => {
        vi.doUnmock(import("nano-spawn"));
    });

    it("should call spawn with --userconfig when npmRcPath is provided", async () => {
        expect.assertions(1);

        const cwd = "/path/to/template";
        const npmRcPath = "/custom/path/.npmrc";
        await localPublish({ cwd, npmRcPath });

        expect(spawnSpy).toHaveBeenCalledWith(
            "npm",
            ["publish", "--userconfig", npmRcPath],
            expect.objectContaining({ cwd }),
        );
    });

    it("should not call spawn with --userconfig when npmRcPath is not provided", async () => {
        expect.assertions(1);

        const cwd = "/path/to/template";
        await localPublish({ cwd });

        expect(spawnSpy).toHaveBeenCalledWith(
            "npm",
            ["publish"],
            expect.objectContaining({ cwd }),
        );
    });
});
