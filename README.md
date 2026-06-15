# cloneman

> Template manager for Node applications and libraries. 🐢

## Usage for consumers

Available commands

- [Create](#create-a-new-application-based-on-a-template)
- [Update](#update-your-application)
- [Verify](#verify)
- [Migrate](#migrate)

### Create a new application based on a template

`npx cloneman@latest create my-new-application template-package-name`

Keep in mind that `template-package-name` needs to be published to the npm registry.

The latest version of the template is installed by default. To install a specific version, specify it using the `@version` suffix:
`npx cloneman@latest create my-new-application template-package-name@1.2.3`

You can also refer to a local template file:
`npx cloneman@latest create my-new-application ../directory/template.tgz`

If the template declares parameters, cloneman will prompt for their values when the terminal is interactive.
Values can also be supplied non-interactively using `--param key=value`:

`npx cloneman@latest create my-new-application template-package-name --param KEY=VALUE`

The `--param` flag can be used multiple times.

### Update your application

> Note: You can only update your application using the same template it was created with.

To the latest version:
`npx cloneman@latest update`

You can also update to a specific version:
`npx cloneman@latest update 1.2.3`

If the template declares parameters, cloneman will prompt for their values when the terminal is interactive.
Values can also be supplied non-interactively using `--param key=value`:

`npx cloneman@latest update --param KEY=VALUE`

The `--param` flag can be used multiple times.

#### Local tarball

As with the create command, you can also point to a local tarball:
`npx cloneman@latest update ../directory/template.tgz`

### Verify

Verifies the application has been updated with the template (NPM dependency).
Typically used to fail the build when an external tool such as Dependabot or Renovate is used to update the NPM dependency.

> `npx cloneman verify`

Exits successfully if the application is up-to-date or with a non-zero status and a detailed instruction if the application needs to be updated.

It is recommended to run this from the `prepare` script in the applications `package.json`:

> `npm pkg set scripts.prepare="cloneman verify"`

### Migrate

Migrates an existing application to use a cloneman template.

`npx cloneman@latest migrate template-package-name`

After migrating, run update to apply the template files:

`npx cloneman@latest update`

Note: the migration won't modify any files other than `package.json`, which connects your application to a specific template. It is up to the update command to actually modify the repository.

## Creating and managing templates

See [docs/templates.md](docs/templates.md) for more information.
