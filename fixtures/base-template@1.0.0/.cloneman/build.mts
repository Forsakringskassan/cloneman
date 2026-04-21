import { buildTemplate } from "cloneman";
import pkg from "../package.json" with { type: "json" };

const targetDir = process.argv[2];
const template = await buildTemplate(pkg.name, pkg, targetDir, {
    managedFiles: ["managed.txt", ".gitignore", "renovate.json"],
    ignoredFiles: ["CHANGELOG.md"],
});
await template.renovateIgnoreDependencies();
