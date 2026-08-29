# BuildTemplateResult interface

The result returned by `buildTemplate`.

```ts
interface BuildTemplateResult {
    readonly files: string[];
    addParameter(
        key: string,
        definition?: Partial<Omit<Parameter, "key">>,
    ): void;
    renovateIgnoreDependencies(): Promise<void>;
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
    updateJson(this: void, filePath: string, content: unknown): Promise<void>;
    writeFile(filePath: string, content: string): Promise<void>;
}
```

## files property

The files included in the template.

**Value**

```js
files: string[];
```

**Example:**

```ts
console.log(template.files);
```

## addParameter method

Declares a parameter that the template requires from the user.
Parameters are collected during `create` and `update`, interactively or through `--param key=value`, and are stored in plain text in the application.

> [!CAUTION]
> Do not use parameters for sensitive information such as API keys or passwords.

**Syntax**

```js
template.addParameter(key, [definition]);
```

**Parameters**

: `key: string`
Parameter key.
It must match `[a-z0-9-]+`.

: `definition: object` (optional)
The parameter definition.

: `definition.defaultValue: string` (optional)
Fallback value used when no existing stored value is present.

: `definition.description: string` (optional)
Human-readable description shown to the user when prompting for input.

: `definition.help: string | null` (optional)
Optional help text shown with the parameter.

: `definition.pattern: string` (optional)
Regular expression used to validate the parameter value.

: `definition.required: boolean` (optional)
When `true`, the user must provide a non-empty value.

**Return value**

Returns nothing.

**Example:**

```ts
const template = await buildTemplate(pkg.name);

template.addParameter("repository", {
    description: "Repository owner and name (e.g. org/my-app)",
    required: true,
    pattern: "[a-z-]+/[a-z-]+",
});
```

## renovateIgnoreDependencies method

Appends template-specific dependencies to the `ignoreDeps` array in the template's `renovate.json`, so Renovate ignores template-managed dependencies.

**Syntax**

```js
template.renovateIgnoreDependencies();
```

**Parameters**

This method has no parameters.

**Return value**

A promise resolved when `renovate.json` has been updated.

**Example:**

```ts
const template = await buildTemplate(pkg.name, config);
await template.renovateIgnoreDependencies();
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
template.replaceInFile(filePath, [matcher], pattern, replacement);
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
await template.replaceInFile("README.md", "Old name", "New name");
```

## updateJson method

Updates the JSON file at the given path with the given content.

- Objects are updated recursively; keys set to `undefined` are removed from the target object.
- Arrays are always replaced.

Existing indentation and a trailing newline are preserved when present.

**Syntax**

```js
template.updateJson(filePath, content);
```

**Parameters**

: `filePath: string`
Path relative to the template root.

: `content: unknown`
Content to add to the existing JSON.

**Return value**

A promise resolved when the JSON file has been updated.

**Example:**

```ts
const template = await buildTemplate(pkg.name, config);

await template.updateJson("package.json", {
    release: {
        extends: ["awesome-preset"],
    },
});
```

## writeFile method

Writes a file to the template's file directory.

**Syntax**

```js
template.writeFile(filePath, content);
```

**Parameters**

: `filePath: string`
Path relative to the template root.

: `content: string`
Content to write to the file.

**Return value**

A promise resolved when the file has been written.

**Example:**

```ts
const template = await buildTemplate(pkg.name, config);

await template.writeFile("foo.txt", "New file");
```
