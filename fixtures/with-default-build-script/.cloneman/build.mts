import { type BuildContext } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export default async ({ buildTemplate }: BuildContext): Promise<void> => {
    const template = await buildTemplate(pkg.name, pkg);
    await template.writeFile("foo.txt", "generated file");
};
