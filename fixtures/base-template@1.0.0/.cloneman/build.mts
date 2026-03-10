import path from "node:path";
/* In a real case scenario, the import here would be the package name, e.g: cloneman */
import {
    buildTemplate,
    readConfigFile,
    readPackageJson,
} from "../../../dist/index.mjs";

const configFile = path.resolve(import.meta.dirname, "cloneman.json");
const templateRoot = path.resolve(import.meta.dirname, "..");

const pkg = await readPackageJson(templateRoot);
const config = await readConfigFile(configFile);

const targetDir = process.argv[2];

const result = await buildTemplate(pkg.name, pkg, targetDir, config);
await result.renovateIgnoreDependencies();
