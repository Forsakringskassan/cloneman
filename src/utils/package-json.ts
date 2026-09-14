import { type Parameter } from "../types";

/**
 * Typings for the `package.json` exports field
 *
 * @public
 */
export interface ExportsCondition {
    [key: string]: string | ExportsCondition;
}
export type ExportsField = string | ExportsCondition;

/**
 * Typings for https://docs.npmjs.com/cli/v11/configuring-npm/package-json
 *
 * @public
 */
export interface PackageJson {
    name: string;
    version: string;
    description?: string | undefined;
    keywords?: string[] | undefined;
    homepage?: string | undefined;
    bugs?: string | { email?: string; url?: string } | undefined;
    repository?: string | { type: string; url: string } | undefined;
    license?: string | undefined;
    author?: string | undefined;
    type?: "module" | "commonjs";
    exports?: ExportsField;
    scripts?: Record<string, string>;
    dependencies?: Partial<Record<string, string>>;
    devDependencies?: Partial<Record<string, string>>;
    peerDependencies?: Partial<Record<string, string>>;
    cloneman?: unknown;
}

/**
 * Typings for block marker.
 *
 * @public
 */
export interface Block {
    begin: string;
    end: string;
}

/**
 * Typings for different kind of markers.
 *
 * @public
 */
export type Markers = { above: string } | { below: string } | { block: Block };

/**
 * Typings for a partially managed file. It specifies name and include markers.
 *
 * @public
 */
export interface PartiallyManagedFile {
    name: string;
    include: Markers;
}

/**
 * Typings for the `package.json` file in the template package.
 *
 * This extends the standard `PackageJson` with additional fields used by cloneman.
 *
 * @public
 */
export interface TemplatePackageJson extends PackageJson {
    cloneman: {
        boilerplateFiles: string[];
        managedFiles: string[];
        partiallyManagedFiles?: PartiallyManagedFile[];
        removeFiles: string[];
        uninstallDependencies: string[];
        ignoredDependencies: string[];
        parameters?: Parameter[];
    };
}

/**
 * Typings for the `package.json` file in the application being managed by cloneman.
 *
 * @internal
 */
export interface ApplicationPackageJson extends PackageJson {
    cloneman?: unknown;
}
