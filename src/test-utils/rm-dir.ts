import { rm } from "node:fs/promises";

export async function rmDir(dir: string): Promise<void> {
    try {
        await rm(dir, { recursive: true, force: true });
    } catch {
        // On Windows CI nodes the directory may be locked and cannot be removed.
    }
}
