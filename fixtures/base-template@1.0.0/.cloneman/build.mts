import { type BuildContext } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export default async ({ buildTemplate }: BuildContext): Promise<void> => {
    const template = await buildTemplate(pkg.name, {
        managedFiles: [
            "managed.txt",
            ".gitignore",
            "glob/**/*.txt",
            "renovate.json",
            ".dot/file.txt",
            ".dot/.sub.file.txt",
            ".dot/.env",
        ],
        ignoredFiles: ["CHANGELOG.md"],
    });
    await template.renovateIgnoreDependencies();
};
