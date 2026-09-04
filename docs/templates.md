# Managing templates

The best way to understand how a template is defined is to check the example template in `./fixtures/base-template`.

A template is required to have:

```plaintext
.cloneman
├── (optional configuration file)
├── (optional hooks)
├── build.{js,cjs,mjs,ts,cts,mts}
└── tsconfig.json
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

    await buildTemplate(pkg.name, {/* configuration */});
}
```

> [!NOTE]
> See the [TypeScript](#using-typescript) below on how to configure typescript support for Cloneman templates.

or with JavaScript (`.cloneman/build.mjs`):

```js
import pkg from "../package.json" with { type: "json" };

/**
 * @param {import("cloneman").BuildContext} context
 */
export default async (context) => {
    const { buildTemplate } = context;

    await buildTemplate(pkg.name, {/* configuration */});
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

    const template = await buildTemplate(pkg.name, {/* configuration */});

    /* add a new file */
    await template.writeFile("awesome.txt", "everything is awesome!");
}
```

See [list of available functions](./api/build-template-result.md) for details.

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

See [configuration reference](./api/configuration.md) for a list of configuration options.

## Functions

See [list of available functions](./api/build-template-result.md).

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
| `repository`  | ✓           | X      | \*     |
| `license`     | ✓           | ✓      | ✓      |
| `author`      | ✓           | ✓      | ✓      |
| \*            |             | ✓      | ✓      |

where:

- "NPM package" refers to the `package.json` published to the NPM registry.
- "create" refers to the `package.json` in the application after running `npx cloneman create`.
- "update" refers to the `package.json` in the application after running `npx cloneman update`.

During `npx cloneman update` fields marked with an asterisk `*` are preserved if present.
If missing from the application they are written from the template.

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
- `replaceInFile(filepath, [matcher], pattern, replacement)` - a helper to replace lines in files.
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

## Using TypeScript

To enable TypeScript support for the Cloneman scripts you first need a `.cloneman/tsconfig.json` file:

```json
{
    "extends": "cloneman/tsconfig.json"
}
```

Optional: if you want to type-check the scripts from a build pipeline either run `tsc -p .cloneman/tsconfig.json` (recommended) or include it with `references` from the main `tsconfig.json `.
