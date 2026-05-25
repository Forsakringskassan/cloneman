import { type InstallContext } from "cloneman";

export default async (context: InstallContext): Promise<void> => {
    await context.writeFile("install.txt", "install script at v1.0.0");
    context.setMessage("custom instruction from v1.0.0");
};
