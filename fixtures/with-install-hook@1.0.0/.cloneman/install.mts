import { type InstallContext } from "cloneman";

export default async (context: InstallContext): Promise<void> => {
    await context.writeFile("install.txt", "install script at v1.0.0");
};
