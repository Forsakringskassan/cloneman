import os from "node:os";
import path from "node:path";
import getPkg from "@semantic-release/npm/lib/get-pkg";
import verifyNpmAuth from "@semantic-release/npm/lib/verify-auth";

import { pack, publish as clonemanPublish } from "cloneman";

import type {
    Config,
    PublishContext,
    VerifyConditionsContext,
} from "semantic-release";

const tempDir = os.tmpdir();

const npmrc = path.join(tempDir, ".npmrc");

const pkgOptions = {
    pkgRoot: ".",
};

const verifyOptions = {
    npmPublish: true,
    pkgRoot: ".",
};

export async function verifyConditions(
    pluginConfig: Config,
    context: VerifyConditionsContext,
): Promise<void> {
    const pkg = await getPkg(pkgOptions, context);
    pkg.private = true;

    await verifyNpmAuth(npmrc, pkg, verifyOptions, context);

    const cwd = context.cwd ?? process.cwd();

    await pack({
        cwd,
        targetDir: path.join(cwd, "./temp/cloneman"),
    });
}

export async function publish(
    pluginConfig: Config,
    context: PublishContext,
): Promise<void> {
    const cwd = context.cwd ?? process.cwd();
    const pkg = await getPkg(pkgOptions, context);
    pkg.private = true;

    await verifyNpmAuth(npmrc, pkg, verifyOptions, context);
    await clonemanPublish({
        cwd,
        npmRcPath: npmrc,
    });
}
