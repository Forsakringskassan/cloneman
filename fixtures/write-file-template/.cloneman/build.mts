import path from "node:path";
import { buildTemplate, readConfigFile } from "cloneman";
import pkg from "../package.json" with { type: "json" };

const configFile = path.resolve(import.meta.dirname, "cloneman.json");
const config = await readConfigFile(configFile);
const targetDir = process.argv[2];

const template = await buildTemplate(pkg.name, pkg, targetDir, config);

await template.writeFile("foo.txt", "Overwritten file");
await template.writeFile("new-file.txt", "new file");
