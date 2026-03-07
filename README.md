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
├── build.mjs
└── cloneman.json
```

### cloneman.json

Contains a list of managed files that will be used when creating and updating an application.

```json
{
    "managedFiles": ["managed.txt"]
}
```

#### managedFiles

List of files owned by the template. These files will be overwritten when updating your application.

### build.mjs

Build script to prepare an application or library to be a cloneman template.

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
