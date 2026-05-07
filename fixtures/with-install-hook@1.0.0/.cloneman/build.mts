import { type BuildContext } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export default async ({ buildTemplate }: BuildContext): Promise<void> => {
    await buildTemplate(pkg.name, {});
};
