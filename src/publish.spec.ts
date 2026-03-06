import path from "node:path";
import spawn from "nano-spawn";
import { afterAll, beforeAll, expect, it } from "vitest";
import { prepare } from "./prepare";
import { publish } from "./publish";
import { authEnv, start, stop } from "./test-utils/npm-registry";
import { temporaryDirectory } from "./test-utils/temporary-directory";

const fixtureDir = path.resolve(import.meta.dirname, "../fixtures");
const baseTemplate = path.join(fixtureDir, "base-template");
const targetDir = temporaryDirectory();

beforeAll(async () => {
    const cwd = baseTemplate;
    await prepare(cwd, targetDir);
    await start(targetDir);
});

afterAll(async () => {
    await stop();
});

it("should publish template", async () => {
    expect.hasAssertions();
    await publish({ cwd: targetDir, env: authEnv });

    const result = await spawn(
        "npm",
        ["info", "@forsakringskassan/base-template", "--json"],
        { env: authEnv },
    );
    const output = JSON.parse(result.output);
    expect(output.name).toBe("@forsakringskassan/base-template");
    expect(output.versions).toContain("1.0.0");
});
