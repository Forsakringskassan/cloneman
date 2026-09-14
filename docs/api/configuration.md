# Configuration reference

Template configuration.

```json
{
    "managedFiles": ["managed.txt"],
    "ignoredFiles": ["package-lock.json"],
    "partiallyManagedFiles": [
        {
            "name": ".gitignore",
            "include": {
                "above": "# lines above are managed by cloneman"
            }
        }
    ]
}
```

**Glob patterns**

Fields that support glob patterns also support negation patterns (prefixed with `!`) to re-include specific entries.
For example, `["@fkui/*", "!@fkui/vue-config"]` matches all `@fkui` packages except `@fkui/vue-config`.

## managedFiles

- type: `string[]`
- default: `[]`

List of files or file glob patterns owned by the template.

All non-ignored files will be included in the template but only the files included in `managedFiles` are updated when running `cloneman update`.
When running `cloneman create` all non-ignored files are always copied.

> [!TIP]
>
> - `package.json` does not need to be listed explicitly, the file is always considered managed.
> - `package-lock.json` is not recommended to list as the consumer is expected to have custom dependencies and thus may end up with a very different lockfile than the template project.

It is considered an error if a file or file glob pattern does not match any files in the template.

## removeFiles

- type: `string[]`
- default: `[]`

List of files to be removed from the application during an update.
Supports exact file names or glob patterns, e.g. `tsconfig.*` to remove all matching files.

Files are removed before copying over the new files from the template.
If `removeFiles` matches entries also present in `managedFiles` the files (or glob patterns) will be removed before copying over the updated files.

## ignoredFiles

- type: `string[]`
- default: `[]`

List of files to exclude when creating a template.
Supports exact file names or glob patterns, e.g. `test/*` to remove all test files.

> [!TIP]
>
> `package-lock.json` is recommended to ignore as the consumer is expected to have custom dependencies and thus may end up with a very different lockfile than the template project.

## partiallyManagedFiles

- type: `Array<{ name: string; include: Markers }>`
- default: `[]`

List of files that are partially managed by the template. These files allow the template to maintain specific sections while preserving user modifications outside those sections.

Each partially managed file has:

- `name`: The file path relative to the template root
- `include`: Specifies which parts of the file to manage using markers

The `include` field can be one of:

- `{ above: string }`: Manage content above the specified marker
- `{ below: string }`: Manage content below the specified marker
- `{ block: { begin: string; end: string } }`: Manage content between begin and end markers

When running `cloneman create`, the entire template file is copied and markers are added if not already included.

When running `cloneman update`, only the specified sections are updated, preserving user content outside those sections. This is useful for configuration files where users may want to add custom settings while keeping template-maintained sections up to date.

## ignoredDependencies

- type: `string[]`
- default: `[]`

List of dependencies to exclude when creating a template.
Supports exact package names or glob patterns, e.g. `@fkui/*` to remove all dependencies in the `@fkui` scope.

## uninstallDependencies

- type: `string[]`
- default: `[]`

List of dependencies to remove from the application during an update.
Useful when a template is migrating between tools, e.g. from Jest to Vitest, to ensure obsolete packages are uninstalled from the application.

Supports exact package names or glob patterns, e.g. `@fkui/*` to remove all dependencies in the `@fkui` scope.
