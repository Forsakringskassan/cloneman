import path from "node:path";
import { buildTemplate, readConfigFile } from "cloneman";
import pkg from "../package.json" with { type: "json" };

const configFile = path.resolve(import.meta.dirname, "cloneman.json");
const config = await readConfigFile(configFile);
const targetDir = process.argv[2];

const template = await buildTemplate(pkg.name, pkg, targetDir, config);

/* change the value of `"bar"` in `foo.json` */
await template.updateJson("foo.json", {
    bar: "overwritten value",
});

/* multiple calls can be used, each one mutates the file further */
await template.updateJson("foo.json", {
    nested: {
        spam: "ham",
    },
});

/* use `undefined` to remove keys */
await template.updateJson("foo.json", {
    nested: {
        baz: undefined,
    },
});
