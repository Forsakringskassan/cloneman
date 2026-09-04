import { describe, expect, it } from "vitest";
import { type PackageJson } from "../../utils";
import { prepareTemplatePackageJson } from "./prepare-template-package-json";

const template: PackageJson = {
    name: "my-template",
    version: "1.0.0",
};

describe("prepareTemplatePackageJson", () => {
    it("should replace name, and version with placeholders", () => {
        expect.assertions(2);

        const pkg: PackageJson = {
            name: "original-name",
            version: "2.0.0",
            description: "original description",
        };
        const result = prepareTemplatePackageJson(template, pkg);
        expect(result.name).toBe("${name}");
        expect(result.version).toBe("${version}");
    });

    it("should add template as a devDependency", () => {
        expect.assertions(1);

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

    it("should remove template specific fields from the package.json", () => {
        expect.assertions(1);

        const pkg: PackageJson = {
            name: "app",
            version: "1.0.0",
            description: "original description",
            repository: "some-repo",
            bugs: "some-bugs",
            homepage: "some-homepage",
            keywords: ["keyword1", "keyword2"],
            author: "author",
            license: "MIT",
        };
        const result = prepareTemplatePackageJson(template, pkg);
        expect(result).toMatchInlineSnapshot(`
          {
            "author": "author",
            "bugs": "some-bugs",
            "cloneman": {},
            "dependencies": {},
            "description": "original description",
            "devDependencies": {
              "my-template": "1.0.0",
            },
            "homepage": "some-homepage",
            "keywords": [
              "keyword1",
              "keyword2",
            ],
            "license": "MIT",
            "name": "\${name}",
            "version": "\${version}",
          }
        `);
    });
});
