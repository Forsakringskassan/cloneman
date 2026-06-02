import { type BuildContext } from "cloneman";
import pkg from "../package.json" with { type: "json" };

export default async ({ buildTemplate }: BuildContext): Promise<void> => {
    const template = await buildTemplate(pkg.name);

    template.addParameter("repository", {
        description: "Repository url",
        help: "This should be a valid URL to a Git repository",
        pattern: "git[+]https://.+",
        required: true,
    });

    template.addParameter("description", {
        description: "Project description",
        required: false,
        defaultValue: "Awesome project",
    });
};
