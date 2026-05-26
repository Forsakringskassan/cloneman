import { defineConfig } from "vitest/config";

const unitTestConfig = defineConfig({
    test: {
        exclude: ["**/node_modules/**", "**/*.integration.spec.ts"],
    },
});

const integrationTestConfig = defineConfig({
    test: {
        globalSetup: ["./vitest.global.ts"],
        include: ["**/*.integration.spec.ts"],
    },
});

export default defineConfig(({ mode }) => {
    const { test } =
        mode === "integration" ? integrationTestConfig : unitTestConfig;
    console.log({ test });
    return {
        test,
        server: {
            watch: {
                ignored: ["**/node_modules/**", "**/temp/**"],
            },
        },
    };
});
