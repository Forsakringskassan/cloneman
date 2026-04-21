import { buildTemplate } from "cloneman";
import pkg from "../package.json" with { type: "json" };

const targetDir = process.argv[2];
const template = await buildTemplate(pkg.name, pkg, targetDir, {
    managedFiles: ["foo.json"],
});

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
