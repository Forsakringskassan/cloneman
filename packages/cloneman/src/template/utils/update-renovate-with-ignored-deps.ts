import { type PackageJson } from "../../utils/package-json";

export function updateRenovateWithIgnoredDeps(
    renovateConfig: Record<string, unknown>,
    pkg: PackageJson,
    templatePackageName: string,
): Record<string, unknown> {
    const ignoredDependencies = [
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.devDependencies ?? {}),
    ].filter((dependencyName) => dependencyName !== templatePackageName);

    renovateConfig["ignoreDeps"] = [
        ...((renovateConfig["ignoreDeps"] as string[] | undefined) ?? []),
        ...ignoredDependencies,
    ];

    return renovateConfig;
}
