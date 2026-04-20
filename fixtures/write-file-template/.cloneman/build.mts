import path from "node:path";
import { buildTemplate, readConfigFile, readPackageJson } from "cloneman";

const configFile = path.resolve(import.meta.dirname, "cloneman.json");
const templateRoot = path.resolve(import.meta.dirname, "..");
const pkg = await readPackageJson(templateRoot);
const config = await readConfigFile(configFile);
const targetDir = process.argv[2];

const template = await buildTemplate(pkg.name, pkg, targetDir, config);

await template.writeFile("foo.txt", "Overwritten file");
await template.writeFile("new-file.txt", "new file");
