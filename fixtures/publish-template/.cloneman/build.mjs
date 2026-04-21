import path from "node:path";
import { buildTemplate, readConfigFile } from "../../../dist/index.mjs";
import pkg from "../package.json" with { type: "json" };

const configFile = path.resolve(import.meta.dirname, "cloneman.json");
const config = await readConfigFile(configFile);
const targetDir = process.argv[2];

await buildTemplate(pkg.name, pkg, targetDir, config);
