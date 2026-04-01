# `@forsakringskassan/semantic-release-cloneman-plugin`

A semantic-release plugin that publishes your [Cloneman](https://github.com/Forsakringskassan/cloneman) template to the npm registry.

## Usage

The recommended way to use this plugin is via the [`@forsakringskassan/semantic-release-cloneman-config`](../semantic-release-cloneman-config) package, which includes this plugin.

To use it standalone, install it manually and append it to your semantic config.

```bash
npm install --save-dev @forsakringskassan/semantic-release-cloneman-plugin
```

Semantic release config

```javascript
{
    "plugins": [
        ...
        ["@forsakringskassan/semantic-release-cloneman-plugin"],
        ...
    ]
}
```
