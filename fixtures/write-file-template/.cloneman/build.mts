import { buildTemplate } from "cloneman";
import pkg from "../package.json" with { type: "json" };

const targetDir = process.argv[2];
const template = await buildTemplate(pkg.name, pkg, targetDir, {
    managedFiles: ["foo.txt"],
});

await template.writeFile("foo.txt", "Overwritten file");
await template.writeFile("new-file.txt", "new file");
