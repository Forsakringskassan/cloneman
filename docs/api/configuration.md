# Configuration reference

Template configuration.

```json
{
    "managedFiles": ["managed.txt"],
    "ignoredDependencies": []
}
```

**Glob patterns**

Fields that support glob patterns also support negation patterns (prefixed with `!`) to re-include specific entries.
For example, `["@fkui/*", "!@fkui/vue-config"]` matches all `@fkui` packages except `@fkui/vue-config`.

## managedFiles

- type: `string[]`
- default: `[]`

List of files owned by the template.

All non-ignored files will be included in the template but only the files included in `managedFiles` are updated when running `cloneman update`.
When running `cloneman create` all non-ignored files are always copied.

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
