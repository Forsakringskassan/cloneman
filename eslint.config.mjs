import defaultConfig from "@forsakringskassan/eslint-config";
import cliConfig from "@forsakringskassan/eslint-config-cli";
import typescriptConfig from "@forsakringskassan/eslint-config-typescript";
import typeinfoConfig from "@forsakringskassan/eslint-config-typescript-typeinfo";
import vitestConfig from "@forsakringskassan/eslint-config-vitest";

export default [
    {
        name: "Ignored files",
        ignores: [
            "**/coverage/**",
            "**/dist/**",
            "**/temp/**",
            "**/public/**",
            "**/node_modules/**",
        ],
    },

    ...defaultConfig,

    cliConfig(),
    typescriptConfig(),
    typeinfoConfig(import.meta.dirname, {
        files: ["packages/cloneman/src/**/*.ts"],
    }),
    vitestConfig(),

    {
        name: "Allow console statements in CLI",
        files: [
            "src/test-utils/**/*.ts",
            "packages/cloneman/src/**/*.ts",
            "packages/cloneman/bin/**/*.mjs",
        ],
        rules: {
            "no-console": "off",
        },
    },

    {
        name: "local/dist",
        files: ["packages/cloneman/fixtures/**/.cloneman/build.mjs"],
        rules: {
            /* depends on dist folder being built */
            "import/no-unresolved": "off",
        },
    },

    {
        name: "local/dist",
        files: ["packages/cloneman/fixtures/**/.cloneman/*.mts"],
        rules: {
            /* Building with Node requires file extension */
            "import/extensions": "off",
        },
    },
];
