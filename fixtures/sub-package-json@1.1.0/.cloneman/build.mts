import { type BuildContext } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export default async ({ buildTemplate }: BuildContext): Promise<void> => {
    const template = await buildTemplate(pkg.name, {
        managedFiles: ["docs/package.json", "renovate.json"],
        ignoredDependencies: ["@forsakringskassan/application-owned"],
    });
    await template.renovateIgnoreDependencies();
};
