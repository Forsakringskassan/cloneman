import { type BuildContext } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export default async ({ buildTemplate }: BuildContext): Promise<void> => {
    const template = await buildTemplate(pkg.name, {
        managedFiles: ["foo.txt"],
    });

    await template.writeFile("foo.txt", "Overwritten file");
    await template.writeFile("new-file.txt", "new file");
};
