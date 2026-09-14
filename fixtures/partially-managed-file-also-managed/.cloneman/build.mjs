import pkg from "../package.json" with { type: "json" };

/**
 * @param {import("cloneman").BuildContext} context
 */
export default async ({ buildTemplate }) => {
    await buildTemplate(pkg.name, {
        managedFiles: [".gitignore"],
        partiallyManagedFiles: [
            { filename: ".gitignore", include: { above: "# template above" } },
        ],
    });
};
