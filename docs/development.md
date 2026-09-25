# Development

## Working with Cloneman

To set up the project locally, install the dependencies and use the provided npm scripts for building and testing:

```bash
# Install & Build
npm install
npm run build

# Run static code analysis and unit tests
npm test

# Run integration tests (this will start a local NPM registry and publish template fixtures)
npm test -- --mode integration
```

## Working with Templates (Debug)

You can build a template locally and refer to it directly when creating or updating an application.

To package a template locally, run:

```bash
npx cloneman pack
```

This command generates a temporary folder (`./temp`) where you can inspect all the generated files. It also creates a `.tar.gz` archive of the template.

You can then refer to this local archive instead of a remote registry to test your templates:

```bash
# Create a new application using the local template archive
npx cloneman@latest create my-new-application path/to/template/template.tgz

# Update an existing application using the local template archive
npx cloneman@latest update path/to/template/template.tgz
```
