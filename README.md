# cloneman

> Template manager for Node applications and libraries. 🐢

## Usage for consumers

Available commands

- Create
- Update

### Create a new application based on a template

`npx cloneman create my-new-application template-package-name`

Keep in mind that `template-package-name` needs to be published to the npm registry.

You can also refer to a local template file:
`npx cloneman create my-new-application ../directory/template.tgz`

### Update your application

> Note: You can only update your application using the same template it was created with.

To the latest version:
`npx cloneman update`

You can also update to a specific version:
`npx cloneman update 1.2.3`

### Local tarball

As with the create command, you can also point to a local tarball:
`npx cloneman update ../directory/template.tgz`

## Usage when creating and managing templates

The best way to understand how a template is defined is to check the example template in `./fixtures/base-template`.

A template is required to have:

```
.cloneman
├── build.{js,mjs,ts,mts}
└── cloneman.json
```

### cloneman.json

Contains a list of managed files that will be used when creating and updating an application.

```json
{
    "managedFiles": ["managed.txt"],
    "ignoredDependencies": []
}
```

#### managedFiles

List of files owned by the template. These files will be overwritten when updating your application.

#### ignoredFiles

List of files to exclude when creating a template.
Supports exact file names or glob patterns, e.g. `test/*` to remove all test files.

#### ignoredDependencies

List of dependencies to exclude when creating a template.
Supports exact package names or glob patterns, e.g. `@fkui/*` to remove all dependencies in the `@fkui` scope.

### build.mjs

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

#### renovateIgnoreDependencies

Append template specific dependencies to the "ignoreDeps" array in the template's "renovate.json".

This makes Renovate ignore dependencies that are managed by the template, while
still allowing updates for dependencies that are not template managed.

## Available commands when working with templates

Both commands requires to be called insisde a template folder.

- Publish
- Pack

### Publish

`npx cloneman publish`

Publish a new template version to the npm registry. (i.e npm publish)

### Pack

`npx cloneman pack`

Creates a local tar file of your template. (i.e npm pack)

## Development

```bash
npm install
npm run build
npm test
```
