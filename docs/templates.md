# Managing templates

The best way to understand how a template is defined is to check the example template in `./fixtures/base-template`.

A template is required to have:

```plaintext
.cloneman
├── (optional configuration file)
├── (optional hooks)
└── build.{js,cjs,mjs,ts,cts,mts}
```

## Building

The build script prepares an application or library to be a cloneman template.
It should export a named function `build` or a default exported function, taking the build context as the only parameter.

With TypeScript (`.cloneman/build.mts`):

```ts
import { type BuildContext } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export async function build(context: BuildContext): Promise<void> {
    const { buildTemplate } = context;

    await buildTemplate(pkg.name, {
        /* configuration */
    });
}
```

or with JavaScript (`.cloneman/build.mjs`):

```js
import pkg from "../package.json" with { type: "json" };

/**
 * @param {import("cloneman").BuildContext} context
 */
export default async (context) => {
    const { buildTemplate } = context;

    await buildTemplate(pkg.name, {
        /* configuration */
    });
};
```

The build context contains:

- `buildTemplate()` - the primary function to build the cloneman template.
- `logger` - a `Console` object to log additional information to the user.
- `targetDir` - the output directory where files will be written.
- `templateDir` - the template directory, typically the root directory of the template repository.

If further processing is needed the `buildTemplate` function returns a template object:

```ts
import { type BuildContext, readConfigFile } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export async function build(context: BuildContext): Promise<void> {
    const { buildTemplate } = context;

    const template = await buildTemplate(pkg.name, {
        /* configuration */
    });

    /* add a new file */
    await template.writeFile("awesome.txt", "everything is awesome!");
}
```

See [list of available functions](#function-reference) for details.

The configuration can optionally be stored in a separate JSON file:

```ts
import path from "node:path";
import { type BuildContext, readConfigFile } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export async function build(context: BuildContext): Promise<void> {
    const { buildTemplate } = context;

    const configFile = path.resolve(import.meta.dirname, "cloneman.json");
    const config = await readConfigFile(configFile);

    await buildTemplate(pkg.name, config);
}
```

## Configuration

Template configuration.

```json
{
    "managedFiles": ["managed.txt"],
    "ignoredDependencies": []
}
```

**Glob patterns**

Fields that support glob patterns also support negation patterns (prefixed with `!`) to re-include specific entries.
For example, `["@fkui/*", "!@fkui/vue-config"]` matches all `@fkui` packages except `@fkui/vue-config`.

### managedFiles

- type: `string[]`
- default: `[]`

List of files owned by the template.

All non-ignored files will be included in the template but only the files included in `managedFiles` are updated when running `cloneman update`.
When running `cloneman create` all non-ignored files are always copied.

### removeFiles

- type: `string[]`
- default: `[]`

List of files to be removed from the application during an update.
Supports exact file names or glob patterns, e.g. `tsconfig.*` to remove all matching files.

Files are removed before copying over the new files from the template.
If `removeFiles` matches entries also present in `managedFiles` the files (or glob patterns) will be removed before copying over the updated files.

### ignoredFiles

- type: `string[]`
- default: `[]`

List of files to exclude when creating a template.
Supports exact file names or glob patterns, e.g. `test/*` to remove all test files.

### ignoredDependencies

- type: `string[]`
- default: `[]`

List of dependencies to exclude when creating a template.
Supports exact package names or glob patterns, e.g. `@fkui/*` to remove all dependencies in the `@fkui` scope.

### uninstallDependencies

- type: `string[]`
- default: `[]`

List of dependencies to remove from the application during an update.
Useful when a template is migrating between tools, e.g. from Jest to Vitest, to ensure obsolete packages are uninstalled from the application.

Supports exact package names or glob patterns, e.g. `@fkui/*` to remove all dependencies in the `@fkui` scope.

## Parameters

Templates can declare parameters that the user must input when creating or updating an application.
Parameters are declared in the build hook with `addParameter()` and their values are read in subsequent hooks with `getParameter()`.

> [!NOTE]
> Parameters must not be used for sensitive information such as API keys, passwords, etc.
> Parameters are persisted in plain-text in the application.

```ts
// .cloneman/build.mts
import { type BuildContext } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export default async ({ buildTemplate }: BuildContext): Promise<void> => {
    const template = await buildTemplate(pkg.name);

    template.addParameter("maintainer", {
        description: "Who maintains this repository (username)",
        required: true,
    });
};
```

```ts
// .cloneman/install.mts
import { type InstallContext } from "cloneman";

export default async (context: InstallContext): Promise<void> => {
    const maintainer = context.getParameter("maintainer");
    await context.writeFile("CODEOWNERS", `* @${maintainer}`);
};
```

## `package.json`

The fields from the template `package.json` will be used by:

| field         | NPM package | create | update |
| ------------- | ----------- | ------ | ------ |
| `name`        | ✓           |        |        |
| `version`     | ✓           |        |        |
| `description` | ✓           |        |        |
| `keywords`    | ✓           | ✓      | \*     |
| `homepage`    | ✓           | ✓      | \*     |
| `bugs`        | ✓           | ✓      | \*     |
| `repository`  | ✓           | ✓      | \*     |
| `license`     | ✓           | ✓      | ✓      |
| `author`      | ✓           | ✓      | ✓      |
| \*            |             | ✓      | ✓      |

where:

- "NPM package" refers to the `package.json` published to the NPM registry.
- "create" refers to the `package.json` in the application after running `npx cloneman create`.
- "update" refers to the `package.json` in the application after running `npx cloneman update`.

During `npx cloneman update` fields marked with an asterisk `*` are preserved if present.
If missing from the application they are written from the template.

## Function reference

### addParameter

Declare a parameter that the template requires from the user.

**Syntax**

```js
template.addParameter(key, definition);
```

**Parameters**

: `key: string`
Unique identifier for the parameter.

: `definition?: object`
Optional options for the parameter.

: `definition.description?: string`
Human-readable description shown to the user.

: `definition.help?: string`
Additional help text shown to the user.

: `definition.required?: boolean`
When `true`, the user must provide a non-empty value.
Cloneman throws an error if no value is available.

: `definition.defaultValue?: string`
Fallback value used when no existing stored value is present and the user does not provide one.

: `definition.pattern?: string`
Optional regular expression (anchored) used to validate the value.
Cloneman throws an error if the value does not match.

**Return value**

`void`

**Example:**

```ts
const template = await buildTemplate(pkg.name);

template.addParameter("repository", {
    description: "Repository owner and name (e.g. org/my-app)",
    required: true,
    pattern: "[a-z-]+/[a-z-]+",
});
```

### renovateIgnoreDependencies

Append template specific dependencies to the "ignoreDeps" array in the template's "renovate.json".

This makes Renovate ignore dependencies that are managed by the template, while
still allowing updates for dependencies that are not template managed.

**Syntax**

```js
renovateIgnoreDependencies();
```

**Parameters**

This function has no parameters

**Return value**

A promise resolved when the `renovate.json` file has been written.

**Example:**

```js
const template = await buildTemplate(pkg.name, config);
await template.renovateIgnoreDependencies();
```

### updateJson

Update the contents of a JSON file in the template.
Multiple updates on the same file

**Syntax**

```js
updateJson(filePath, content);
```

**Parameters**

: `filePath: string`
Path relative to the template root.

: `content: unknown`
Content to add to the existing JSON.

**Return value**

A promise resolved when the updated file has been written.

**Example**

```ts
const template = await buildTemplate(pkg.name, config);

await template.updateJson("package.json", {
    release: {
        extends: ["awesome-preset"],
    },
});
```

### writeFile

Create or modify files in a template

**Example**

```ts
const template = await buildTemplate(pkg.name, config);

await template.writeFile("foo.txt", "New file");
```

## Hooks

Hooks are additional scripts placed in the `.cloneman` folder.
Each hook must be self-contained and cannot reference other files or libraries.
`type` imports may be used but no type-checking is performed by Cloneman itself.

### Install hook

The install hook run when the client creates or updates the application in the context of their repository.

```plaintext
.cloneman
├── install.{js,cjs,mjs,ts,cts,mts}
```

The install hook should export a named function `install` or a default exported function, taking the install context as the only parameter.

With TypeScript (`.cloneman/install.mts`):

```ts
import { type InstallContext } from "cloneman";

export async function install(context: InstallContext): Promise<void> {
    /* perform custom installation steps */
}
```

The install context contains:

- `targetDir` - the application directory.
- `logger` - a `Console` object to log information to the user.
- `version` - a readonly object with the `newVersion` and `oldVersion` fields.
- `getApplicationName()` - returns the name of the application (typically from the `name` field in `package.json`).
- `getApplicationSlug()` - returns a slug derived from the application name, safe for use in urls, selectors, etc.
- `getApplicationSelector()` - returns a CSS class selector derived from the application name.
- `getParameter(key)` - returns the value of a declared parameter (see [Parameters](#parameters)).
- `readFile(filePath)` - a helper function to read a file.
- `readJsonFile(filePath)` - a helper function to read a json file.
- `writeFile(filePath, content)` - a helper function to write a file.
- `writeJsonFile(filePath, content)` - a helper function to write a json file.
- `updateJsonFile(filePath, content)` - a helper function to update an existing json file.

All helper functions taking a filePath are relative to the application directory.
File operations return a promise resolved when the operation is complete.

Use `cloneman run-hook install` to run the hook locally from inside your template repository without publishing a new version.

The hook is resolved from `.cloneman/` in the current directory.
Pass `--target` to specify the application directory the hook should act on (defaults to the current directory):

```sh
npx cloneman run-hook install --target ../my-application
```

## Available commands when working with templates

These commands requires to be called inside a template folder.

- `build`
- `pack`
- `publish`
- `run-hook`

### Build

> `npx cloneman build -o temp/template`

Build template to a temporary directory.

Typical usage is to test or debug a template before publishing, or for usage in a CI pipeline to ensure the template builds properly.

### Pack

> `npx cloneman pack`

Similar to the build command, but also creates a local tar file of your template. (i.e npm pack)

### Publish

> `npx cloneman publish`

Publish a new template version to the npm registry. (i.e npm publish)

### Run Hook

> `npx cloneman run-hook HOOK`

Run a hook from `.cloneman/` in the current template directory against a target application directory.
By default the current directory is used as the target.
Use `--target` to run the hook against a different application:

> `npx cloneman run-hook install --target ../my-application`

The `version.oldVersion` passed to the hook context is always `null` (simulating a fresh install), and `version.newVersion` is read from the template's own `package.json`.
