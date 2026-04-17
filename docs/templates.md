# Managing templates

The best way to understand how a template is defined is to check the example template in `./fixtures/base-template`.

A template is required to have:

```
.cloneman
├── build.{js,mjs,ts,mts}
└── cloneman.json
```

## cloneman.json

Contains a list of managed files that will be used when creating and updating an application.

```json
{
    "managedFiles": ["managed.txt"],
    "ignoredDependencies": []
}
```

### managedFiles

List of files owned by the template. These files will be overwritten when updating your application.

### ignoredFiles

List of files to exclude when creating a template.
Supports exact file names or glob patterns, e.g. `test/*` to remove all test files.

### ignoredDependencies

List of dependencies to exclude when creating a template.
Supports exact package names or glob patterns, e.g. `@fkui/*` to remove all dependencies in the `@fkui` scope.

### uninstallDependencies

List of dependencies to remove from the application during an update.
Useful when a template is migrating between tools, e.g. from Jest to Vitest, to ensure obsolete packages are uninstalled from the application.

Supports exact package names or glob patterns, e.g. `@fkui/*` to remove all dependencies in the `@fkui` scope.

## build.mjs

Build script to prepare an application or library to be a cloneman template.

Import and call `buildTemplate` in order to generate a Cloneman template. This function itself returns sub functions to OPT in more features.

```js
import path from "node:path";
import { buildTemplate, readConfigFile, readPackageJson } from "cloneman";

const configFile = path.resolve(import.meta.dirname, "cloneman.json");
const templateRoot = path.resolve(import.meta.dirname, "..");

const pkg = await readPackageJson(templateRoot);
const config = await readConfigFile(configFile);

const targetDir = process.argv[2];

const template = await buildTemplate(pkg.name, pkg, targetDir, config);
await template.renovateIgnoreDependencies();
```

### renovateIgnoreDependencies

Append template specific dependencies to the "ignoreDeps" array in the template's "renovate.json".

This makes Renovate ignore dependencies that are managed by the template, while
still allowing updates for dependencies that are not template managed.

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

**Examples**

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

# Available commands when working with templates

Both commands requires to be called insisde a template folder.

- `build`
- `pack`
- `publish`

## Build

> `npx cloneman build -o temp/template`

Build template to a temporary directory.

Typical usage is to test or debug a template before publishing, or for usage in a CI pipeline to ensure the template builds properly.

## Pack

> `npx cloneman pack`

Similar to the build command, but also creates a local tar file of your template. (i.e npm pack)

## Publish

> `npx cloneman publish`

Publish a new template version to the npm registry. (i.e npm publish)

## Development

```bash
npm install
npm run build
npm test
```

```

```
