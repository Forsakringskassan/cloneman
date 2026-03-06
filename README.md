# cloneman

> Template manager for Node applications and libraries 🐢

## Usage for consumers

Avaiable commands

- Create
- Update

### Create a new application based on a template

`npx cloneman create my-new-application template-package-name`

Keep in mind that `template-package-name` needs to be published in the NPM registry.

You can also refer to a local template file:
`npx cloneman create my-new-application ../directory/template.tgz`

### Update your application

> Note: You can only update your application using the same template it was created with.

To latest version:
`npx cloneman update`

You can also update to a specific version:
`npx cloneman update 1.2.3`

### Local tarball

As with the create command, you can also point to a local tarball:
`npx cloneman update ../directory/template.tgz`

## Usage when creating and managing templates

Avaiable commands

- Publish
- Pack

## Development

```bash
npm install
npm run build
npm test
```
