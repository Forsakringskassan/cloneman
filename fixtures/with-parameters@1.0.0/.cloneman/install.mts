import { type InstallContext } from "cloneman";

export default async (context: InstallContext): Promise<void> => {
    const repository = context.getParameter("repository");
    const description = context.getParameter("description");
    await context.writeFile(
        "parameters.txt",
        `repository=${repository}\ndescription=${description}`,
    );
};
