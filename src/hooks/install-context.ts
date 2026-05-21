import { type Console } from "node:console";
import { type PackageJson } from "../utils";

/**
 * @public
 * @since v1.12.0
 */
export interface InstallContext {
    /**
     * Path to the application being created/updated
     */
    readonly targetDir: string;

    /**
     * A console instance to be used for logging (do not log directly on stdout
     * or stderr).
     */
    readonly logger: Console;

    /**
     * Template version.
     *
     * When this is a newly created application (`npx cloneman create`) the
     * `oldVersion` field is `null`.
     *
     * @public
     * @since %version%
     */
    readonly version: {
        readonly oldVersion: string | null;
        readonly newVersion: string;
    };

    /**
     * Get the application name, e.g. the `name` field in `package.json`.
     *
     * @public
     * @since %version%
     * @param options - Optional options:
     *   - `unscoped` - When `true`, the returned name is the package name without the scope. Default `false`.
     * @returns The application name.
     */
    getApplicationName(options?: { unscoped?: boolean }): string;

    /**
     * Returns a slug derived from the application name.
     *
     * - `foo` becomes `foo`
     * - `@scope/foo` becomes `scope--foo`.
     * - name is lowercased
     * - all non-alphanumeric characters except for hyphens and underscores are removed.
     *
     * @public
     * @since %version%
     * @returns Application slug.
     */
    getApplicationSlug(): string;

    /**
     * Returns a CSS class selector derived from the application name.
     *
     * - `foo` becomes `.foo`
     * - `@scope/foo` becomes `.scope--foo`.
     * - name is lowercased
     * - all non-alphanumeric characters except for hyphens and underscores are removed.
     *
     * @public
     * @since %version%
     * @returns Application CSS selector.
     */
    getApplicationSelector(): string;

    /**
     * Read file content.
     *
     * @public
     * @since v1.12.0
     * @param filePath - Path relative to application root.
     * @returns A promise resolved with the file content.
     *
     * @example
     *
     * ```ts
     * const content = await context.readFile("example.txt");
     * ```
     */
    readFile(filePath: string): Promise<string>;

    /**
     * Read and parse a JSON file.
     *
     * @public
     * @since v1.12.0
     * @param filePath - Path relative to application root.
     * @returns A promise resolved with the parsed file content.
     *
     * @example
     *
     * ```ts
     * const content = await context.readJsonFile("example.json");
     * ```
     */
    readJsonFile(filePath: "package.json"): Promise<PackageJson>;

    /**
     * Read and parse a JSON file.
     *
     * @public
     * @since v1.12.0
     * @param filePath - Path relative to application root.
     * @returns A promise resolved with the parsed file content.
     *
     * @example
     *
     * ```ts
     * const content = await context.readJsonFile("example.json");
     * ```
     */
    readJsonFile<T = unknown>(filePath: string): Promise<T>;

    /**
     * Write content to file.
     *
     * @public
     * @since v1.12.0
     * @param filePath - Path relative to application root.
     * @param content - File content to write.
     * @returns A promise resolved when the file has been written.
     *
     * @example
     *
     * ```ts
     * await context.writeFile("example.txt", "lorem ipsum");
     * ```
     */
    writeFile(filePath: string, content: string): Promise<void>;

    /**
     * Serialize JSON and write to file.
     *
     * If the file exists, the existing indentation is used when writing the new
     * file.
     *
     * @public
     * @since v1.12.0
     * @param filePath - Path relative to application root.
     * @param content - File content to write.
     * @returns A promise resolved when the file has been written.
     *
     * @example
     *
     * ```ts
     * await context.writeJsonFile("example.json", {
     *   foo: "lorem ipsum"
     * });
     * ```
     */
    writeJsonFile(filePath: string, content: unknown): Promise<void>;

    /**
     * Updates the content of the JSON file at given path with given content.
     *
     * - Objects are updated recursively, keys set to `undefined` are removed
     *   from the target object.
     * - Arrays are always replaced.
     *
     * Trailing newline is preserved if present.
     *
     * @public
     * @since v1.12.0
     * @param filePath - Path relative to the application root.
     * @param content - Content to add to the existing JSON.
     * @returns A promise resolved when the updated file has been written.
     *
     * @example
     *
     * ```ts
     * await context.updateJsonFile("example.json", {
     *   foo: "lorem ipsum"
     * });
     * ```
     */
    updateJsonFile(filePath: string, content: object): Promise<void>;
}
