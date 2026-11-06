# Update your application

> $ npx cloneman@latest update [version] [--if-same-filehash] [--install] [--param key=value]

## Options

### version

The version to update to. This argument is optional and defaults to `latest` if it is not specified.

### --param

If the template declares parameters, cloneman will prompt for their values when the terminal is interactive.
Values can also be supplied non-interactively using `--param key=value`:

`npx cloneman@latest update --param KEY=VALUE`

The `--param` flag can be used multiple times.

### --only-dependencies

Updates only the dependencies and devDependencies without modifying other files.

**Important limitation**:
The content of managed files must remain unchanged between versions. If the file list has changed, an error is thrown and a full update is required.

A common use case for this feature is within a Renovate postUpgradeTask, where you only want the update to proceed if no managed files are modified.

### --install

Runs `npm install` in the application directory after updating the template, to install the dependencies declared in the updated `package.json`. If this option is omitted, run `npm install` manually to install the updated dependencies.

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

### Ignore files

Set `cloneman.ignoreFiles` in the application's `package.json` to file paths or glob patterns for local files that should be left unchanged during updates, such as machine-specific configuration. These files must not be tracked by Git.

Tracked files are part of the shared codebase and are expected to follow the template. If you exclude them from updates, your project drifts away from the template and misses its fixes and improvements. At that point, much of the benefit of using a template is lost. T

The update command reports an error if a matching file is tracked.

```diff
{
  "cloneman": {
    ... # Version, filehash defined by Cloneman
+    "ignoreFiles": ["managed.txt", "config/*.json"]
  }
}
```

## Local tarball

As with the create command, you can also point to a local tarball:
`npx cloneman@latest update ../directory/template.tgz`

## Cannot change template

You can only update your application using the same template it was created with.
