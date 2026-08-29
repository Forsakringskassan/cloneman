# InstallContext interface

The `context` parameter for install scripts.

```ts
interface InstallContext {
    readonly command: "create" | "update";
    readonly logger: Console;
    readonly relativeTargetDir: string;
    readonly targetDir: string;
    readonly version: {
        readonly oldVersion: string | null;
        readonly newVersion: string;
    };
    getApplicationName(options?: { unscoped?: boolean }): string;
    getApplicationSelector(): string;
    getApplicationSlug(): string;
    getParameter(key: string): string;
    readFile(filePath: string): Promise<string>;
    readJsonFile(filePath: "package.json"): Promise<PackageJson>;
    readJsonFile<T = unknown>(filePath: string): Promise<T>;
    replaceInFile(
        filePath: string,
        pattern: string | RegExp,
        replacement: string,
    ): Promise<void>;
    replaceInFile(
        filePath: string,
        matcher: RegExp,
        pattern: string | RegExp,
        replacement: string,
    ): Promise<void>;
    setMessage(text: string | string[], delimiter?: string): void;
    updateJsonFile(filePath: string, content: object): Promise<void>;
    writeFile(filePath: string, content: string): Promise<void>;
    writeJsonFile(filePath: string, content: unknown): Promise<void>;
}
```

## command property

The command being issued by the user.

**Value**

```js
command: "create" | "update";
```

**Example:**

```ts
if (context.command === "update") {
    context.logger.info("Updating the application");
}
```

## logger property

A console instance to use for logging.

> [!CAUTION]
> Do not write directly to stdout or stderr.

**Value**

```js
logger: Console;
```

**Example:**

```ts
context.logger.info("Installing template files");
```

## relativeTargetDir property

The application directory, relative to the current working directory.

**Value**

```js
relativeTargetDir: string;
```

**Example:**

```ts
context.logger.info(`Updating ${context.relativeTargetDir}`);
```

## targetDir property

The application directory being created or updated.

**Value**

```js
targetDir: string;
```

**Example:**

```ts
context.logger.info(`Writing files to ${context.targetDir}`);
```

## version property

The template version.
`oldVersion` is `null` when creating a new application.

**Value**

```js
version: {
    oldVersion: string | null;
    newVersion: string;
}
```

**Example:**

```ts
/* Would only run if an update is performed. */
if (context.version.oldVersion) {
    context.logger.info(
        `Updating from ${context.version.oldVersion} to ${context.version.newVersion}`,
    );
}
```

## getApplicationName method

Gets the application name, such as the `name` field in `package.json`.

**Syntax**

```js
context.getApplicationName([options]);
```

**Parameters**

: `options: object` (optional)
Optional options.

: `options.unscoped: boolean` (optional)
Set to `true` to omit the package scope.
Default `false`.

**Return value**

Returns the application name as `string`.

**Example:**

```ts
console.log(context.getApplicationName({ unscoped: true }));
```

Given an application named `@scope/foobar`, the example outputs `foobar`.

## getApplicationSelector method

Returns a CSS class selector derived from the application name.

- `foo` becomes `.foo`
- `@scope/foo` becomes `.scope--foo`.
- name is lowercased
- all non-alphanumeric characters except for hyphens and underscores are removed.

**Syntax**

```js
context.getApplicationSelector();
```

**Parameters**

This method has no parameters.

**Return value**

Returns the application CSS selector as `string`.

**Example:**

```ts
console.log(context.getApplicationSelector());
```

Given an application named `@scope/foobar`, the example outputs `.scope--foobar`.

## getApplicationSlug method

Returns a slug derived from the application name.

- `foo` becomes `foo`
- `@scope/foo` becomes `scope--foo`.
- name is lowercased
- all non-alphanumeric characters except for hyphens and underscores are removed.

**Syntax**

```js
context.getApplicationSlug();
```

**Parameters**

This method has no parameters.

**Return value**

Returns the application slug as `string`.

**Example:**

```ts
console.log(context.getApplicationSlug());
```

Given an application named `@scope/foobar`, the example outputs `scope--foobar`.

## getParameter method

Gets a template parameter value by key.
The key must have been declared with `addParameter` in the build hook.

**Syntax**

```js
context.getParameter(key);
```

**Parameters**

: `key: string`
The declared parameter key.

**Return value**

Returns the parameter value as `string`.

**Example:**

```ts
const repository = context.getParameter("repository");
await context.updateJsonFile("package.json", {
    repository: {
        url: repository,
    },
});
```

When the user supplies `--param repository=https://example.net/org/project.git`,
the example sets `repository.url` in `package.json` to
`https://example.net/org/project.git`.

## readFile method

Reads file content.

**Syntax**

```js
context.readFile(filePath);
```

**Parameters**

: `filePath: string`
Path relative to the application root.

**Return value**

A promise resolved with the file content as `string`.

**Example:**

```ts
const readme = await context.readFile("README.md");
context.logger.info(readme);
```

## readJsonFile method

Reads and parses a JSON file.

**Syntax**

```js
context.readJsonFile(filePath);
```

**Parameters**

: `filePath: string`
Path relative to the application root.

**Return value**

A promise resolved with the parsed file content as `T`.

**Example:**

```ts
const packageJson = await context.readJsonFile("package.json");
console.log(packageJson.name);
```

## replaceInFile method

Replaces each occurrence of `pattern` with `replacement`.
When `matcher` is provided, replacements are limited to lines that match it.
Replacements happen line by line.

> [!TIP]
> Use the global `/g` flag to replace multiple matches when `pattern` is a regular expression.
> Without it, only the first occurrence is replaced.

**Syntax**

```js
context.replaceInFile(filePath, [matcher], pattern, replacement);
```

**Parameters**

: `filePath: string`
Path relative to the application root.

: `matcher: RegExp` (optional)
Regular expression that identifies lines where replacements are made.

: `pattern: string | RegExp`
Pattern to replace in the file.

: `replacement: string`
Replacement value.

**Return value**

A promise resolved when the file has been updated.

**Example:**

```ts
await context.replaceInFile("README.md", "Old name", "New name");
```

## setMessage method

Overrides the default message shown after the application is created or updated.

**Syntax**

```js
context.setMessage(text, [delimiter]);
```

**Parameters**

: `text: string | string[]`
The message to show.
Arrays are joined with `delimiter`.

: `delimiter: string` (optional)
Delimiter for array values.
Defaults to `\n`.

**Return value**

Returns nothing.

**Example:**

```ts
context.setMessage("Template update complete");
```

The message is shown after the application has been created or updated.

## updateJsonFile method

Updates a JSON file.
Objects are updated recursively, keys set to `undefined` are removed, and arrays are replaced.

**Syntax**

```js
context.updateJsonFile(filePath, content);
```

**Parameters**

: `filePath: string`
Path relative to the application root.

: `content: object`
Content to add to the existing JSON.

**Return value**

A promise resolved when the JSON file has been updated.

**Example:**

```ts
await context.updateJsonFile("package.json", {
    scripts: {
        test: "vitest run",
    },
});
```

## writeFile method

Writes content to a file.

**Syntax**

```js
context.writeFile(filePath, content);
```

**Parameters**

: `filePath: string`
Path relative to the application root.

: `content: string`
Content to write.

**Return value**

A promise resolved when the file has been written.

**Example:**

```ts
await context.writeFile(".nvmrc", "24\n");
```

## writeJsonFile method

Serializes JSON and writes it to a file.

**Syntax**

```js
context.writeJsonFile(filePath, content);
```

**Parameters**

: `filePath: string`
Path relative to the application root.

: `content: unknown`
Content to write.

**Return value**

A promise resolved when the JSON file has been written.

**Example:**

```ts
await context.writeJsonFile("package.json", {
    name: "my-application",
    private: true,
});
```
