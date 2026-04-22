import pkg from "../package.json" with { type: "json" };

/**
 * @param {import("cloneman").BuildContext} context
 */
export default async (context) => {
    const { buildTemplate } = context;
    const template = await buildTemplate(pkg.name, pkg, {
        managedFiles: ["managed.txt"],
        ignoredDependencies: ["@forsakringskassan/lib-used-by-templates"],
    });
    await template.renovateIgnoreDependencies();
};
