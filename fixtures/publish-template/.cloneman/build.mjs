import pkg from "../package.json" with { type: "json" };

/**
 * @param {import("../../../dist/index.d.ts").BuildContext} context
 */
export default async (context) => {
    const { buildTemplate } = context;
    await buildTemplate(pkg.name, {
        managedFiles: ["managed.txt"],
    });
};
