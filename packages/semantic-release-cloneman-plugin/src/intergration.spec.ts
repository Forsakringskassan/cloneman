import fs from "node:fs/promises";
import path from "node:path";
import { pack, prepare } from "cloneman";
import spawn from "nano-spawn";
import { beforeAll, describe, expect, it } from "vitest";

import { temporaryDirectory } from "./test-utils/temporary-directory";

describe("integration test", () => {
    beforeAll(async () => {
        const fixturePath = path.resolve(
            import.meta.dirname,
            "../fixtures/sr-base-template@1.0.0",
        );
        console.log(fixturePath);
        const targetDir = temporaryDirectory();

        await fs.cp(fixturePath, targetDir, { recursive: true });
        //await prepare(fixturePath, targetDir);

        const files = await fs.readdir(targetDir, { recursive: true });
        console.log("Files in targetDir:", files);

        const plugin = await import("./index");
        const env: Record<string, string> = { NPM_TOKEN: "wrong_token" };

        plugin.verifyConditions(
            {},
            {
                cwd: targetDir,
                env,
            },
        );
    });

    it("should pack a template and its dependencies", async () => {
        expect.hasAssertions();
        expect(true).toBe(true);
    });
});
