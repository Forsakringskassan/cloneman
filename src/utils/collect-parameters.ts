import {
    ParameterInvalidPatternError,
    ParameterRequiredError,
    ParameterValidationError,
} from "../errors";
import { type Parameter } from "../types";
import { promptParameter } from "./prompt-parameter";

export interface CollectParametersOptions {
    definitions: Parameter[];
    existing: Map<string, string>;
    overrides: Map<string, string>;
    interactive: boolean;
}

/**
 * @internal
 */
export function valueMatches(
    parameter: { key: string; pattern: string },
    value: string,
): boolean {
    let regexp: RegExp;
    try {
        regexp = new RegExp(`^(?:${parameter.pattern})$`);
    } catch (err) {
        throw new ParameterInvalidPatternError(parameter, { cause: err });
    }
    return regexp.test(value);
}

function validateParameter(
    parameter: Parameter,
    value: string | undefined,
): void {
    const { key, required, pattern } = parameter;
    if (required && (value === undefined || value === "")) {
        throw new ParameterRequiredError(key);
    }
    if (value && pattern && !valueMatches({ ...parameter, pattern }, value)) {
        throw new ParameterValidationError({
            parameter: key,
            value,
            pattern,
        });
    }
}

/**
 * Collects parameter values for a template.
 *
 * @internal
 */
export async function collectParameters(
    options: CollectParametersOptions,
): Promise<Map<string, string>> {
    const { definitions, existing, overrides, interactive } = options;
    const result = new Map<string, string>();

    for (const definition of definitions) {
        const { key, defaultValue } = definition;

        /* overrides are used as-is */
        if (overrides.has(key)) {
            /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we just checked it with Map.has() */
            const value = overrides.get(key)!;
            validateParameter(definition, value);
            result.set(key, value);
            continue;
        }

        const effectiveDefault = existing.get(key) ?? defaultValue;

        /* in interactive mode we query the user for the parameter value, when
         * not interactive the value "should" have been passed in as an override
         * but if it wasn't we use the default value */
        let value: string | undefined;
        if (interactive) {
            value = await promptParameter(definition, effectiveDefault);
        } else {
            value = effectiveDefault;
        }

        validateParameter(definition, value);
        result.set(key, value ?? "");
    }

    return result;
}
