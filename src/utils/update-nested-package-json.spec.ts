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

    it("should keep the key order of the template package.json", () => {
        expect.assertions(1);
        const template: PackageJson = {
            name: "template",
            version: "1.0.0",
            dependencies: { owned: "2.0.0" },
            scripts: { build: "tsc" },
            devDependencies: { "owned-dev": "2.0.0" },
        };
        const current: PackageJson = {
            name: "app",
            version: "1.0.0",
            devDependencies: { "extra-dev": "1.0.0" },
            scripts: { build: "user" },
            dependencies: { extra: "1.0.0" },
        };

        const result = updateNestedPackageJson(
            { packageJson: template, path: "docs/package.json" },
            current,
            [],
            [],
            false,
        );

        expect(Object.keys(result)).toMatchInlineSnapshot(`
          [
            "name",
            "version",
            "dependencies",
            "scripts",
            "devDependencies",
          ]
        `);
    });

    it("should not add dependencies or devDependencies when there are none", () => {
        expect.assertions(2);
        const template: PackageJson = { name: "template", version: "1.0.0" };
        const current: PackageJson = { name: "app", version: "1.0.0" };

        const result = updateNestedPackageJson(
            { packageJson: template, path: "docs/package.json" },
            current,
            [],
            [],
            false,
        );

        expect(result).not.toHaveProperty("dependencies");
        expect(result).not.toHaveProperty("devDependencies");
    });

    it("should leave existing empty dependencies and devDependencies untouched", () => {
        expect.assertions(2);
        const template: PackageJson = {
            name: "template",
            version: "1.0.0",
            dependencies: {},
            devDependencies: {},
        };
        const current: PackageJson = { name: "app", version: "1.0.0" };

        const result = updateNestedPackageJson(
            { packageJson: template, path: "docs/package.json" },
            current,
            [],
            [],
            false,
        );

        expect(result.dependencies).toEqual({});
        expect(result.devDependencies).toEqual({});
    });
});
