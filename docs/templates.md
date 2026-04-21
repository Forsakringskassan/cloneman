# Managing templates

The best way to understand how a template is defined is to check the example template in `./fixtures/base-template`.

A template is required to have:

```
.cloneman
├── (optional configuration file)
├── (optional hooks)
└── build.{js,mjs,ts,mts}
```

## Building

The build script prepares an application or library to be a cloneman template.

Import and call `buildTemplate()` in order to generate a Cloneman template:

```ts
import { buildTemplate } from "cloneman";
import pkg from "../package.json" with { type: "json" };

const targetDir = process.argv[2];
await buildTemplate(pkg.name, pkg, targetDir, {
    /* configuration */
});
```

If further processing is needed the function returns a context object:

```ts
const template = await buildTemplate(pkg.name, pkg, targetDir, {
    /* configuration */
});

/* add a new file */
template.writeFile("awesome.txt", "everything is awesome!");
```

See (list of available functions)[#function-reference] for details.

The configuration can optionally be stored in a separate JSON file:

```ts
import path from "node:path";
import { readConfigFile } from "cloneman";

const configFile = path.resolve(import.meta.dirname, "cloneman.json");
const config = await readConfigFile(configFile);
```

## Configuration

Template configuration.

```json
{
    "managedFiles": ["managed.txt"],
    "ignoredDependencies": []
}
```

### managedFiles

- type: `string[]`
- default: `[]`

List of files owned by the template.

All non-ignored files will be included in the template but only the files included in `managedFiles` are updated when running `cloneman update`.
When running `cloneman create` all non-ignored files are always copied.

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

## Function reference

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
const template = await buildTemplate(pkg.name, pkg, targetDir, config);
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
const template = await buildTemplate(pkg.name, pkg, targetDir, config);

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
const template = await buildTemplate(pkg.name, pkg, targetDir, config);

await template.writeFile("foo.txt", "New file");
```

## Available commands when working with templates

Both commands requires to be called insisde a template folder.

- `build`
- `pack`
- `publish`

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
