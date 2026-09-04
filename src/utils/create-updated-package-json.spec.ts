import { describe, expect, it } from "vitest";
import { createUpdatedPackageJson } from "./create-updated-package-json";
import { type PackageJson } from "./package-json";

const tarballPackageJson: PackageJson = {
    name: "@forsakringskassan/template",
    version: "1.2.3",
};

const baselinePackageJson: PackageJson = {
    name: "@forsakringskassan/baseline",
    version: "1.2.3",
};

describe("createUpdatedPackageJson", () => {
    it("should sort keys based on current package.json", () => {
        expect.assertions(2);

        const currentPackageJson: PackageJson = {
            name: "implementation",
            version: "1.0.0",
            license: "implementation",
            author: "implementation",
            description: "implementation",
            repository: "implementation",
            keywords: ["implementation"],
        };

        const templatePackageJson: PackageJson = {
            name: "${name}",
            version: "${version}",
            license: "template",
            keywords: ["template"],
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
            "author": "implementation",
            "cloneman": {
              "fileHash": "hash",
              "parameters": {},
              "template": "@forsakringskassan/template",
              "version": "1.2.3",
            },
            "dependencies": {},
            "description": "implementation",
            "devDependencies": {
              "@forsakringskassan/template": "1.2.3",
            },
            "keywords": [
              "implementation",
            ],
            "license": "template",
            "name": "implementation",
            "repository": "implementation",
            "version": "1.0.0",
          }
        `);

        expect(Object.keys(result)).toStrictEqual([
            "name",
            "version",
            "license",
            "author",
            "description",
            "repository",
            "keywords",
            "dependencies",
            "devDependencies",
            "cloneman",
        ]);
    });

    it("should not add application owned fields if not present in current package.json", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            name: "implementation",
            version: "implementation",
        };

        const templatePackageJson: PackageJson = {
            name: "template",
            version: "template",
            description: "template",
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

        expect(Object.keys(result)).toStrictEqual([
            "name",
            "version",
            "dependencies",
            "devDependencies",
            "cloneman",
        ]);
    });

    it("shoukd keep application owned fields if present in current package.json", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            name: "implementation",
            version: "implementation",
            description: "implementation",
            author: "implementation",
            keywords: ["implementation"],
            bugs: "implementation",
            homepage: "implementation",
            repository: "implementation",
        };

        const templatePackageJson: PackageJson = {
            name: "template",
            version: "template",
            description: "template",
            author: "template",
            keywords: ["template"],
            bugs: "template",
            homepage: "template",
            repository: "template",
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
            "author": "implementation",
            "bugs": "implementation",
            "cloneman": {
              "fileHash": "hash",
              "parameters": {},
              "template": "@forsakringskassan/template",
              "version": "1.2.3",
            },
            "dependencies": {},
            "description": "implementation",
            "devDependencies": {
              "@forsakringskassan/template": "1.2.3",
            },
            "homepage": "implementation",
            "keywords": [
              "implementation",
            ],
            "name": "implementation",
            "repository": "implementation",
            "version": "implementation",
          }
        `);
    });

    it("non application owned fields should be taken from template package.json", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            ...baselinePackageJson,
            scripts: { implementation: "implementation" },
        };

        const templatePackageJson: PackageJson = {
            ...baselinePackageJson,
            scripts: { template: "template" },
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

        expect(result.scripts).toEqual({ template: "template" });
    });

    it("dependencies should be taken from provided dependencies", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            ...baselinePackageJson,
            dependencies: { implementation: "implementation" },
        };

        const templatePackageJson: PackageJson = {
            ...baselinePackageJson,
            dependencies: { template: "template" },
        };

        const result = createUpdatedPackageJson({
            currentPackageJson,
            templatePackageJson,
            dependencies: { provided: "provided" },
            devDependencies: {},
            tarballPackageJson,
            version: "1.2.3",
            parameters: new Map(),
            fileHash: "hash",
        });
        expect(result.dependencies).toEqual({ provided: "provided" });
    });

    it("devDependencies should be taken from provided devDependencies parameter and template should be appended", () => {
        expect.assertions(1);

        const currentPackageJson: PackageJson = {
            ...baselinePackageJson,
            devDependencies: { implementation: "implementation" },
        };

        const templatePackageJson: PackageJson = {
            ...baselinePackageJson,
            devDependencies: { template: "template" },
        };

        const result = createUpdatedPackageJson({
            currentPackageJson,
            templatePackageJson,
            dependencies: {},
            devDependencies: { provided: "provided" },
            tarballPackageJson,
            version: "1.2.3",
            parameters: new Map(),
            fileHash: "hash",
        });
        expect(result.devDependencies).toEqual({
            "@forsakringskassan/template": "1.2.3",
            provided: "provided",
        });
    });
});
