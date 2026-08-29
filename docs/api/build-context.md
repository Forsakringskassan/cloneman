# BuildContext interface

The `context` parameter for build scripts in `.cloneman/build.mts`.

```ts
interface BuildContext {
    readonly logger: Console;
    readonly targetDir: string;
    readonly templateDir: string;
    buildTemplate(
        this: void,
        name: string,
        config?: TemplateConfig,
    ): Promise<BuildTemplateResult>;
    buildTemplate(
        this: void,
        name: string,
        config: NormalizedTemplateConfig,
    ): Promise<BuildTemplateResult>;
}
```

## logger property

A console instance to use for logging.

> [!CAUTION]
> Do not write directly to stdout or stderr.

**Value**

```js
logger: Console;
```

**Example:**

```ts
context.logger.info("Building template");
```

## targetDir property

The output directory where files are written.

**Value**

```js
targetDir: string;
```

**Example:**

```ts
context.logger.info(context.targetDir);
```

## templateDir property

The template directory, typically the root of the template repository.

**Value**

```js
templateDir: string;
```

**Example:**

```ts
context.logger.info(context.templateDir);
```

## buildTemplate method

Builds a cloneman template.

**Syntax**

```js
buildTemplate(name, [config]);
```

**Parameters**

: `name: string`
The name to publish this package as.

: `config: TemplateConfig` (optional)
Template configuration.

: `config: NormalizedTemplateConfig`
A normalized template configuration.

**Return value**

A promise resolved with the built template result as [`BuildTemplateResult`](./build-template-result.md).

**Example:**

```ts
const template = await context.buildTemplate("my-template");
await template.writeFile("README.md", "# My template");
```
