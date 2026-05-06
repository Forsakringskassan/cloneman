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
        const result = prepareTemplatePackageJson(template, pkg);
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
        const result = prepareTemplatePackageJson(template, pkg);
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
        const result = prepareTemplatePackageJson(template, pkg);
        expect(result.devDependencies).toEqual(
            expect.objectContaining({
                "my-template": "1.0.0",
            }),
        );
    });
});
