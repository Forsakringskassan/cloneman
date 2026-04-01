import { matchesGlob } from "node:path";

export function isIgnored(key: string, ignored: string[]): boolean {
    return ignored.some((pattern) => matchesGlob(key, pattern));
}
