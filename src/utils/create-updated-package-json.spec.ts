import { describe, expect, it } from "vitest";
import { createUpdatedPackageJson } from "./create-updated-package-json";
import { type PackageJson } from "./package-json";

describe("createUpdatedPackageJson", () => {
    it("should use the tarball package name and version for the devDependency and cloneman metadata", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            name: "app",
            version: "1.0.0",
        };
        const templatePackageJson: PackageJson = {
            name: "${name}",
            version: "${version}",
        };
        const tarballPackageJson: PackageJson = {
            name: "my-template",
            version: "1.2.3",
        };

        const result = createUpdatedPackageJson({
            currentPackageJson,
            templatePackageJson,
            dependencies: {},
            devDependencies: {},
            tarballPackageJson,
            version: "1.2.3",
            parameters: new Map(),
            fileHash: "hash",
        });

        expect(result).toMatchInlineSnapshot(`
          {
            "author": undefined,
            "bugs": undefined,
            "cloneman": {
              "fileHash": "hash",
              "parameters": {},
              "template": "my-template",
              "version": "1.2.3",
            },
            "dependencies": {},
            "description": undefined,
            "devDependencies": {
              "my-template": "1.2.3",
            },
            "homepage": undefined,
            "keywords": undefined,
            "name": "app",
            "repository": undefined,
            "version": "1.0.0",
          }
        `);
    });

    it("should use version instead of tarballPackageJson.version for the devDependency entry", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            name: "app",
            version: "1.0.0",
        };
        const templatePackageJson: PackageJson = {
            name: "${name}",
            version: "${version}",
        };
        const tarballPackageJson: PackageJson = {
            name: "my-template",
            version: "1.2.3",
        };

        const result = createUpdatedPackageJson({
            currentPackageJson,
            templatePackageJson,
            dependencies: {},
            devDependencies: {},
            tarballPackageJson,
            version: "../local-template.tgz",
            parameters: new Map(),
            fileHash: "hash",
        });

        expect(result.devDependencies).toMatchInlineSnapshot(`
          {
            "my-template": "../local-template.tgz",
          }
        `);
    });

    it("should include the provided dependencies and devDependencies", () => {
        expect.assertions(2);

        const currentPackageJson: PackageJson = {
            name: "app",
            version: "1.0.0",
        };
        const templatePackageJson: PackageJson = {
            name: "${name}",
            version: "${version}",
        };
        const tarballPackageJson: PackageJson = {
            name: "my-template",
            version: "1.0.0",
        };

        const result = createUpdatedPackageJson({
            currentPackageJson,
            templatePackageJson,
            dependencies: { lodash: "4.17.20" },
            devDependencies: { vitest: "2.0.0" },
            tarballPackageJson,
            version: "1.0.0",
            parameters: new Map(),
            fileHash: "hash",
        });

        expect(result.dependencies).toMatchInlineSnapshot(`
          {
            "lodash": "4.17.20",
          }
        `);
        expect(result.devDependencies).toMatchInlineSnapshot(`
          {
            "my-template": "1.0.0",
            "vitest": "2.0.0",
          }
        `);
    });

    it("should convert parameters to an object on the cloneman metadata", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            name: "app",
            version: "1.0.0",
        };
        const templatePackageJson: PackageJson = {
            name: "${name}",
            version: "${version}",
        };
        const tarballPackageJson: PackageJson = {
            name: "my-template",
            version: "1.0.0",
        };

        const result = createUpdatedPackageJson({
            currentPackageJson,
            templatePackageJson,
            dependencies: {},
            devDependencies: {},
            tarballPackageJson,
            version: "1.0.0",
            parameters: new Map([
                ["foo", "bar"],
                ["baz", "qux"],
            ]),
            fileHash: "hash",
        });

        expect(result.cloneman).toMatchObject({
            parameters: { foo: "bar", baz: "qux" },
        });
    });

    it("should keep application-owned fields from the current package.json instead of the template", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            name: "app",
            version: "0.0.1",
            description: "app description",
            author: "app author",
            keywords: ["app-keyword"],
            bugs: "app-bugs",
            homepage: "app-homepage",
            repository: "app-repo",
        };
        const templatePackageJson: PackageJson = {
            name: "${name}",
            version: "${version}",
            description: "template description",
            author: "template author",
            keywords: ["template-keyword"],
            bugs: "template-bugs",
            homepage: "template-homepage",
            repository: "template-repo",
        };
        const tarballPackageJson: PackageJson = {
            name: "my-template",
            version: "1.0.0",
        };

        const result = createUpdatedPackageJson({
            currentPackageJson,
            templatePackageJson,
            dependencies: {},
            devDependencies: {},
            tarballPackageJson,
            version: "1.0.0",
            parameters: new Map(),
            fileHash: "hash",
        });

        expect(result).toMatchInlineSnapshot(`
          {
            "author": "app author",
            "bugs": "app-bugs",
            "cloneman": {
              "fileHash": "hash",
              "parameters": {},
              "template": "my-template",
              "version": "1.0.0",
            },
            "dependencies": {},
            "description": "app description",
            "devDependencies": {
              "my-template": "1.0.0",
            },
            "homepage": "app-homepage",
            "keywords": [
              "app-keyword",
            ],
            "name": "app",
            "repository": "app-repo",
            "version": "0.0.1",
          }
        `);
    });

    it("should not add application-owned fields that are absent from the current package.json", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            name: "app",
            version: "0.0.1",
        };
        const templatePackageJson: PackageJson = {
            name: "${name}",
            version: "${version}",
            description: "template description",
        };
        const tarballPackageJson: PackageJson = {
            name: "my-template",
            version: "1.0.0",
        };

        const result = createUpdatedPackageJson({
            currentPackageJson,
            templatePackageJson,
            dependencies: {},
            devDependencies: {},
            tarballPackageJson,
            version: "1.0.0",
            parameters: new Map(),
            fileHash: "hash",
        });

        expect(result.description).toBeUndefined();
    });

    it("should order fields like the current package.json, appending remaining fields afterwards", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            name: "app",
            version: "0.0.1",
            description: "app description",
            author: "app author",
            keywords: ["app-keyword"],
            bugs: "app-bugs",
            homepage: "app-homepage",
            repository: "app-repo",
        };
        const templatePackageJson: PackageJson = {
            name: "${name}",
            version: "${version}",
            license: "MIT",
        };
        const tarballPackageJson: PackageJson = {
            name: "my-template",
            version: "1.0.0",
        };

        const result = createUpdatedPackageJson({
            currentPackageJson,
            templatePackageJson,
            dependencies: {},
            devDependencies: {},
            tarballPackageJson,
            version: "1.0.0",
            parameters: new Map(),
            fileHash: "hash",
        });

        expect(Object.keys(result)).toMatchInlineSnapshot(`
          [
            "name",
            "version",
            "description",
            "author",
            "keywords",
            "bugs",
            "homepage",
            "repository",
            "license",
            "dependencies",
            "devDependencies",
            "cloneman",
          ]
        `);
    });
});
