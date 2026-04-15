import { FetchTarballError } from "../errors";
import { info } from "./npm";
/**
 * Fetches the tarball for a given npm package and version from the registry.
 *
 * @internal
 * @returns The tarball contents as a Buffer and the resolved version.
 */
export async function fetchTarball(
    templatePackage: string,
    version: string,
    env: Record<string, string>,
): Promise<{ buffer: Buffer; version: string }> {
    const tarballUrl = await info<string>(`${templatePackage}@${version}`, {
        field: "dist.tarball",
        env,
    });

    const resolvedVersion = await info<string>(
        `${templatePackage}@${version}`,
        {
            field: "version",
            env,
        },
    );

    const response = await fetch(tarballUrl);
    if (!response.ok) {
        throw new FetchTarballError(
            templatePackage,
            tarballUrl,
            response.status.toString(),
            response.statusText,
        );
    }
    return {
        buffer: Buffer.from(await response.arrayBuffer()),
        version: resolvedVersion,
    };
}
