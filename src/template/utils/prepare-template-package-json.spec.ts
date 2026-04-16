import { describe, expect, it } from "vitest";
import { type PackageJson } from "../../utils/package-json";
import { prepareTemplatePackageJson } from "./prepare-template-package-json";

const template: PackageJson = {
    name: "my-template",
    version: "1.0.0",
};

describe("prepareTemplatePackageJson", () => {
    it("should replace name, description, and version with placeholders", () => {
        expect.hasAssertions();

        const pkg: PackageJson = {
            name: "original-name",
            version: "2.0.0",
            description: "original description",
        };
        const result = prepareTemplatePackageJson(template, pkg, []);
        expect(result.name).toBe("${name}");
        expect(result.version).toBe("${version}");
        expect(result.description).toBe("${description}");
    });

    it("should set cloneman field to template metadata", () => {
        expect.hasAssertions();

        const pkg: PackageJson = {
            name: "app",
            version: "1.0.0",
        };
        const result = prepareTemplatePackageJson(template, pkg, []);
        expect(result.cloneman).toEqual({
            template: "my-template",
            version: "1.0.0",
        });
    });

    it("should add template as a devDependency", () => {
        expect.hasAssertions();

        const pkg: PackageJson = {
            name: "app",
            version: "1.0.0",
        };
        const result = prepareTemplatePackageJson(template, pkg, []);
        expect(result.devDependencies).toEqual(
            expect.objectContaining({
                "my-template": "1.0.0",
            }),
        );
    });

    it("should filter out ignored dependencies from dependencies", () => {
        expect.hasAssertions();

        const pkg: PackageJson = {
            name: "app",
            version: "1.0.0",
            dependencies: {
                "keep-me": "^1.0.0",
                "ignore-me": "^2.0.0",
            },
        };
        const result = prepareTemplatePackageJson(template, pkg, ["ignore-me"]);
        expect(result.dependencies).toEqual({ "keep-me": "^1.0.0" });
    });

    it("should filter out ignored dependencies from devDependencies", () => {
        expect.hasAssertions();

        const pkg: PackageJson = {
            name: "app",
            version: "1.0.0",
            devDependencies: {
                "keep-dev": "^1.0.0",
                "ignore-dev": "^2.0.0",
            },
        };
        const result = prepareTemplatePackageJson(template, pkg, [
            "ignore-dev",
        ]);
        expect(result.devDependencies).toHaveProperty("keep-dev", "^1.0.0");
        expect(result.devDependencies).not.toHaveProperty("ignore-dev");
    });

    it("should handle missing dependencies and devDependencies", () => {
        expect.hasAssertions();

        const pkg: PackageJson = {
            name: "app",
            version: "1.0.0",
        };
        const result = prepareTemplatePackageJson(template, pkg, []);
        expect(result.dependencies).toEqual({});
        expect(result.devDependencies).toEqual({
            "my-template": "1.0.0",
        });
    });

    it("should filter dependencies using glob patterns", () => {
        expect.hasAssertions();

        const pkg: PackageJson = {
            name: "app",
            version: "1.0.0",
            dependencies: {
                "@scope/foo": "^1.0.0",
                "@scope/bar": "^1.0.0",
                "other-dep": "^2.0.0",
            },
        };
        const result = prepareTemplatePackageJson(template, pkg, ["@scope/*"]);
        expect(result.dependencies).toEqual({ "other-dep": "^2.0.0" });
    });

    it("should support multiple glob patterns", () => {
        expect.hasAssertions();

        const pkg: PackageJson = {
            name: "app",
            version: "1.0.0",
            dependencies: {
                "@scope/foo": "^1.0.0",
                "eslint-plugin-foo": "^1.0.0",
                "keep-me": "^1.0.0",
            },
        };
        const result = prepareTemplatePackageJson(template, pkg, [
            "@scope/*",
            "eslint-*",
        ]);
        expect(result.dependencies).toEqual({ "keep-me": "^1.0.0" });
    });
});
