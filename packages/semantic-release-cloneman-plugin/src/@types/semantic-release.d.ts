declare module "@semantic-release/npm/lib/verify-auth" {
    import type { NormalizedPackageJson } from "read-pkg";
    import type { VerifyConditionsContext } from "semantic-release";

    interface VerifyNpmAuthOptions {
        npmPublish?: boolean;
        pkgRoot?: string;
    }

    export default function verifyNpmAuth(
        npmrc: string,
        pkg: NormalizedPackageJson,
        pluginConfig: VerifyNpmAuthOptions,
        context: VerifyConditionsContext,
    ): Promise<void>;
}

declare module "@semantic-release/npm/lib/get-pkg" {
    interface GetPkgOptions {
        pkgRoot?: string;
    }

    import type { NormalizedPackageJson } from "read-pkg";
    import type { VerifyConditionsContext } from "semantic-release";

    export default function getPkg(
        pluginConfig: GetPkgOptions,
        context: Pick<VerifyConditionsContext, "cwd">,
    ): Promise<NormalizedPackageJson>;
}
