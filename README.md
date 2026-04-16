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

## Creating and managing templates

See [docs/templates.md](docs/templates.md) for more information.
