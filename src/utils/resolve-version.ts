import * as semver from "semver";
import { info } from "./npm";

/**
 * @internal
 * Resolves the requested update target to a concrete template version and
 * optionally emits a notice when a newer major is available.
 */
export async function resolveVersion(options: {
    template: string;
    currentVersion: string;
    target: string;
    env: Record<string, string>;
}): Promise<{ resolvedVersion: string; notice?: string }> {
    const { template, currentVersion, target, env } = options;

    if (target === "latest") {
        const resolvedVersion = await info<string>(`${template}@latest`, {
            field: "version",
            env,
        });
        return { resolvedVersion };
    }

    if (target !== "minor" && target !== "patch") {
        return { resolvedVersion: target };
    }

    const versionList = await info(template, {
        field: "versions",
        env,
    });
    const versions = Array.isArray(versionList)
        ? versionList
              .filter((it): it is string => typeof it === "string")
              .filter((it) => Boolean(semver.valid(it)))
        : [];

    const range =
        target === "minor" ? `^${currentVersion}` : `~${currentVersion}`;
    const resolvedVersion = semver.maxSatisfying(versions, range);
    if (!resolvedVersion) {
        throw new Error(
            `Could not resolve ${target} update for template "${template}" from ${currentVersion}`,
        );
    }

    const latestVersion = await info<string>(`${template}@latest`, {
        field: "version",
        env,
    });

    const latest = semver.valid(latestVersion);
    if (!latest || semver.major(latest) <= semver.major(currentVersion)) {
        return { resolvedVersion };
    }

    return {
        resolvedVersion,
        notice: `A new template version is available (${latestVersion}). Run "cloneman update latest" to upgrade.`,
    };
}
