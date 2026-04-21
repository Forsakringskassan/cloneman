import { buildTemplate } from "../../../dist/index.mjs";
import pkg from "../package.json" with { type: "json" };

const targetDir = process.argv[2];
await buildTemplate(pkg.name, pkg, targetDir, {
    managedFiles: ["managed.txt"],
});
