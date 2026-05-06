import { describe, expect, it } from "vitest";
import { type PackageJson } from "../../utils/package-json";
import {
    type RenovateJson,
    updateRenovateWithIgnoredDeps,
} from "./update-renovate-with-ignored-deps";

describe("updateRenovateWithIgnoredDeps", () => {
    it("should append dependency names except package name", () => {
        expect.hasAssertions();

        const renovateConfig: RenovateJson = {};
        const pkg: PackageJson = {
            name: "${name}",
            version: "1.0.0",
            dependencies: {
                "@aws-sdk/client-s3": "^3.0.0",
            },
            devDependencies: {
                "@aws-sdk/client-dynamodb": "^3.0.0",
                "my-template": "1.0.0",
            },
        };

        const result = updateRenovateWithIgnoredDeps(
            renovateConfig,
            pkg,
            "my-template",
        );

        expect(result).toEqual({
            ignoreDeps: ["@aws-sdk/client-dynamodb", "@aws-sdk/client-s3"],
        });
    });

    it("should include managed dependencies", () => {
        expect.hasAssertions();

        const renovateConfig: RenovateJson = {};
        const pkg: PackageJson = {
            name: "${name}",
            version: "1.0.0",
            dependencies: {
                "awesome-dependency": "^1.0.0",
            },
        };

        const result = updateRenovateWithIgnoredDeps(
            renovateConfig,
            pkg,
            "my-template",
        );

        expect(result).toEqual({
            ignoreDeps: ["awesome-dependency"],
        });
    });

    it("should include managed devDependencies", () => {
        expect.hasAssertions();

        const renovateConfig: RenovateJson = {};
        const pkg: PackageJson = {
            name: "${name}",
            version: "1.0.0",
            devDependencies: {
                "awesome-dev-dependency": "^1.0.0",
            },
        };

        const result = updateRenovateWithIgnoredDeps(
            renovateConfig,
            pkg,
            "my-template",
        );

        expect(result).toEqual({
            ignoreDeps: ["awesome-dev-dependency"],
        });
    });

    it("should include managed peerDependencies", () => {
        expect.hasAssertions();

        const renovateConfig: RenovateJson = {};
        const pkg: PackageJson = {
            name: "${name}",
            version: "1.0.0",
            peerDependencies: {
                "awesome-peer-dependency": "^1.0.0",
            },
        };

        const result = updateRenovateWithIgnoredDeps(
            renovateConfig,
            pkg,
            "my-template",
        );

        expect(result).toEqual({
            ignoreDeps: ["awesome-peer-dependency"],
        });
    });

    it("should keep existing ignoreDeps and append new ones", () => {
        expect.hasAssertions();

        const renovateConfig: RenovateJson = {
            ignoreDeps: ["existing-dep"],
        };
        const pkg: PackageJson = {
            name: "${name}",
            version: "1.0.0",
            dependencies: {
                "new-dep": "^1.0.0",
            },
        };

        const result = updateRenovateWithIgnoredDeps(
            renovateConfig,
            pkg,
            "my-template",
        );

        expect(result).toEqual({
            ignoreDeps: ["existing-dep", "new-dep"],
        });
    });

    it("should handle package without dependencies", () => {
        expect.hasAssertions();

        const renovateConfig: RenovateJson = {};
        const pkg: PackageJson = {
            name: "${name}",
            version: "1.0.0",
        };

        const result = updateRenovateWithIgnoredDeps(
            renovateConfig,
            pkg,
            "my-template",
        );

        expect(result).toEqual({
            ignoreDeps: [],
        });
    });
});
