This fixture uses the `template.updateJson()` method to mutate the `foo.json` file before publishing.

1. The template contains the managed file `foo.json`.
2. The build script mutates `foo.json`.

When publishing the mutated `foo.json` will be used instead of the original file.
