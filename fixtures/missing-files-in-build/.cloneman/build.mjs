import pkg from "../package.json" with { type: "json" };

/**
 * @param {import("cloneman").BuildContext} context
 */
export default async (context) => {
    const { buildTemplate } = context;
    await buildTemplate(pkg.name, {
        managedFiles: ["non-existing-file"],
    });
};
