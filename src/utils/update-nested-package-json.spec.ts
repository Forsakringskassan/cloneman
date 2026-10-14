import { describe, expect, it } from "vitest";
import { type PackageJson } from "./package-json";
import { updateNestedPackageJson } from "./update-nested-package-json";

describe("updateNestedPackageJson", () => {
    it("should merge dependencies and devDependencies from template and application", () => {
        expect.assertions(2);
        const template: PackageJson = {
            name: "template",
            version: "1.0.0",
            dependencies: { owned: "2.0.0" },
            devDependencies: { "owned-dev": "2.0.0" },
        };
        const current: PackageJson = {
            name: "app",
            version: "1.0.0",
            dependencies: { owned: "1.0.0", extra: "1.0.0" },
            devDependencies: { "owned-dev": "1.0.0", "extra-dev": "1.0.0" },
        };

        const result = updateNestedPackageJson(
            { packageJson: template, path: "docs/package.json" },
            current,
            [],
            [],
            false,
        );

        expect(result.dependencies).toEqual({
            extra: "1.0.0",
            owned: "2.0.0",
        });
        expect(result.devDependencies).toEqual({
            "extra-dev": "1.0.0",
            "owned-dev": "2.0.0",
        });
    });
});
