/**
 * Typings for https://docs.npmjs.com/cli/v11/configuring-npm/package-json
 * @public
 */
export interface PackageJson {
    name: string;
    version: string;
    scripts?: Record<string, string>;
    description?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    cloneman?: unknown;
}

/**
 * Typings for the `package.json` file in the template package.
 *
 * This extends the standard `PackageJson` with additional fields used by cloneman.
 * @public
 */
export interface TemplatePackageJson extends PackageJson {
    cloneman: {
        boilerplateFiles: string[];
        managedFiles: string[];
    };
}
