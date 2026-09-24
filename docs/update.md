# Update your application

> $ npx cloneman@latest update [version] [--if-same-filehash] [--param key=value]

## Options

### version

The version to update to. This argument is optional and defaults to `latest` if it is not specified.

### --param

If the template declares parameters, cloneman will prompt for their values when the terminal is interactive.
Values can also be supplied non-interactively using `--param key=value`:

`npx cloneman@latest update --param KEY=VALUE`

The `--param` flag can be used multiple times.

### --if-same-filehash

If this option is enabled, the update task will fail if the before and after filehash differ.

A common use case for this feature is within a Renovate postUpgradeTask, where you only want the update to proceed if no managed files are modified.

## Package.json

Following fields wont be modified during an update:

- name
- version
- description
- author
- keywords
- bugs
- homepage
- repository

## Local tarball

As with the create command, you can also point to a local tarball:
`npx cloneman@latest update ../directory/template.tgz`

## Cannot change template

You can only update your application using the same template it was created with.
