import fs from "node:fs/promises";
import path from "node:path";
import spawn from "nano-spawn";
import { type TestProject } from "vitest/node";
import { prepare } from "./src/prepare";
import { publish } from "./src/publish";
import {
    getAuthEnv,
    getAuthToken,
    getRegistryHost,
    getUserEnv,
    start,
    stop,
} from "./src/test-utils/npm-registry";
import { temporaryDirectory } from "./src/test-utils/temporary-directory";

async function createSymlink(src: string, dst: string): Promise<void> {
    try {
        await fs.symlink(
            path.join(import.meta.dirname),
            path.join(src, dst),
            "junction",
        );
    } catch (err) {
        if (err instanceof Error && "code" in err && err.code === "EEXIST") {
            // ignore, symlink already exists
        } else {
            throw err;
        }
    }
}

async function publishFixture(
    fixture: string,
    authEnv: Record<string, string>,
): Promise<void> {
    console.log(`Publishing fixture ${fixture}...`);
    const fixturePath = path.resolve(import.meta.dirname, "fixtures", fixture);
    const targetDir = temporaryDirectory();
    try {
        await fs.mkdir(path.join(fixturePath, "node_modules"), {
            recursive: true,
        });
        await createSymlink(fixturePath, "node_modules/cloneman");
        await prepare(fixturePath, targetDir);
        await writeNpmRc(targetDir);
        await publish({ cwd: targetDir, env: authEnv });
    } finally {
        await fs.rm(targetDir, { recursive: true, force: true });
    }
}

async function publishPackage(
    fixture: string,
    authEnv: Record<string, string>,
): Promise<void> {
    console.log(`Publishing NPM package ${fixture}...`);
    const fixturePath = path.resolve(import.meta.dirname, "fixtures", fixture);
    const targetDir = temporaryDirectory();
    try {
        await fs.cp(fixturePath, targetDir, { recursive: true });
        await writeNpmRc(targetDir);
        await spawn("npm", ["publish"], {
            cwd: targetDir,
            env: authEnv,
        });
    } finally {
        await fs.rm(targetDir, { recursive: true, force: true });
    }
}

function npmrc(): string {
    return [
        `registry=http://${getRegistryHost()}`,
        `//${getRegistryHost()}/:_authToken=${getAuthToken()}`,
    ].join("\n");
}

async function writeNpmRc(dst: string): Promise<void> {
    const content = npmrc();
    const filePath = path.join(dst, ".npmrc");
    await fs.writeFile(filePath, content);
}

export async function setup(project: TestProject): Promise<void> {
    console.group("Starting local NPM registry");

    try {
        const authEnv = await start();
        await publishPackage("lib-used-by-templates", authEnv);
        await publishFixture("base-template@1.0.0", authEnv);
        await publishFixture("base-template@1.0.1", authEnv);
        await publishPackage("non-template-package", authEnv);
    } catch (error) {
        await stop();
        throw error;
    } finally {
        console.groupEnd();
    }

    project.provide("userEnv", getUserEnv());
    project.provide("authEnv", getAuthEnv());
    project.provide("npmrc", npmrc());
}

export async function teardown(): Promise<void> {
    console.log("Stopping verdaccio server...");
    await stop();
}
