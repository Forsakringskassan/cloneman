import { type BuildContext } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export default async ({ buildTemplate }: BuildContext): Promise<void> => {
    const template = await buildTemplate(pkg.name, pkg, {
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
};
