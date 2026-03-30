import { FetchTarballError } from "../errors";
import { info } from "./npm";
/**
 * Fetches the tarball for a given npm package and version from the registry.
 *
 * @internal
 * @returns The tarball contents as a Buffer.
 */
export async function fetchTarball(
    templatePackage: string,
    version: string,
    env: Record<string, string>,
): Promise<Buffer> {
    const tarballUrl = await info<string>(`${templatePackage}@${version}`, {
        field: "dist.tarball",
        env,
    });
    const response = await fetch(tarballUrl);
    if (!response.ok) {
        throw new FetchTarballError(
            templatePackage,
            tarballUrl,
            response.status.toString(),
            response.statusText,
        );
    }
    return Buffer.from(await response.arrayBuffer());
}
