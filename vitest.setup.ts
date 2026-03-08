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

async function publishFixture(
    fixture: string,
    authEnv: Record<string, string>,
): Promise<void> {
    console.log(`Publishing fixture ${fixture}...`);
    const fixturePath = path.resolve(import.meta.dirname, "fixtures", fixture);
    const targetDir = temporaryDirectory();
    try {
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
    return `//${getRegistryHost()}/:_authToken="${getAuthToken()}"\n`;
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
