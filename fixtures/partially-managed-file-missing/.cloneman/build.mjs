import pkg from "../package.json" with { type: "json" };

/**
 * @param {import("cloneman").BuildContext} context
 */
export default async ({ buildTemplate }) => {
    await buildTemplate(pkg.name, {
        partiallyManagedFiles: [
            { filename: "missing.txt", include: { above: "# template above" } },
        ],
    });
};
