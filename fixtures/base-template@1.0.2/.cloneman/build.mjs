import pkg from "../package.json" with { type: "json" };

/**
 * @param {import("cloneman").BuildContext} context
 */
export default async (context) => {
    const { buildTemplate } = context;
    await buildTemplate(pkg.name, {
        managedFiles: ["managed.txt"],
        ignoredDependencies: ["@forsakringskassan/lib-used-by-templates"],
        uninstallDependencies: ["@forsakringskassan/old-lib"],
    });
};
