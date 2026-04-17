# cloneman

> Template manager for Node applications and libraries. 🐢

## Usage for consumers

Available commands

- Create
- Update
- verify

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

#### Local tarball

As with the create command, you can also point to a local tarball:
`npx cloneman update ../directory/template.tgz`

### Verify

Verifies the application has been updated with the template (NPM dependency).
Typically used to fail the build when an external tool such as Dependabot or Renovate is used to update the NPM dependency.

> `npx cloneman verify`

Exits successfully if the application is up-to-date or with a non-zero status and a detailed instruction if the application needs to be updated.

It is recommended to run this from the `prepare` script in the applications `package.json`:

> `npm pkg set scripts.prepare="cloneman verify"`

## Creating and managing templates

See [docs/templates.md](docs/templates.md) for more information.
