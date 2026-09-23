import { type Parameter } from "./types";
import { info } from "./utils";

/**
 * Fetch the template parameters for a given package and version. Only packages published to the npm registry are supported.
 * @internal
 */
export async function getTemplateParams(options: {
    packageName: string;
    env?: Record<string, string>;
}): Promise<Parameter[]> {
    const { packageName, env = {} } = options;

    let params: Parameter[] = [];

    try {
        params = await info<Parameter[]>(packageName, {
            field: "cloneman.parameters",
            env,
        });
    } catch {
        /* empty */
    }

    return params;
}
