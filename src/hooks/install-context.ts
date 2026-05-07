/**
 * @public
 * @since %version%
 */
export interface InstallContext {
    /** Path to the application being created/updated */
    readonly cwd: string;

    /**
     * A console instance to be used for logging (do not log directly on stdout
     * or stderr).
     */
    readonly logger: Console;

    /**
     * Read file content.
     *
     * @public
     * @since %version%
     * @param filePath - Path relative to application root.
     * @returns A promise resolved with the file content.
     *
     * @example
     *
     * ```ts
     * const content = await context.readFile("example.txt");
     * ```
     */
    readFile(): Promise<void>;

    /**
     * Read and parse a JSON file.
     *
     * @public
     * @since %version%
     * @param filePath - Path relative to application root.
     * @returns A promise resolved with the parsed file content.
     *
     * @example
     *
     * ```ts
     * const content = await context.readJsonFile("example.json");
     * ```
     */
    readJsonFile(): Promise<void>;

    /**
     * Write content to file.
     *
     * @public
     * @since %version%
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
     * @since %version%
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
     * @public
     * @since %version%
     * @param filePath - Path relative to the template root.
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
    updateJsonFile(filePath: string, content: unknown): Promise<void>;
}
