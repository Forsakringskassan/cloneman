import esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    format: "esm",
    platform: "node",
    external: ["@semantic-release/npm"],
    outfile: "dist/index.js",
});
