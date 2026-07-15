import readline from "node:readline";
import { styleText } from "node:util";
import { type Parameter } from "../types";

/**
 * @internal
 */
export function promptText(
    parameter: Partial<Parameter> & Pick<Parameter, "key">,
    defaultValue: string | undefined,
): string {
    const { description, key, help } = parameter;

    const question = description ?? key;
    const suffix =
        defaultValue !== undefined
            ? `[${styleText("dim", defaultValue)}] ?`
            : `?`;

    if (help) {
        const indented = help
            .trimEnd()
            .split("\n")
            .map((it, index, array) => {
                const prefix = styleText(
                    "dim",
                    index !== array.length - 1 ? "│" : "╵",
                );
                return `${prefix} ${it}`;
            })
            .join("\n");
        return `${question}\n${indented}\n${suffix} `;
    }
    return `${question} ${suffix} `;
}

/**
 * Interactively prompts the user for a parameter value via stdin.
 *
 * @internal
 * @param parameter - Parameter definition.
 * @param defaultValue - Default value returned when the user submits an empty response.
 * @returns The entered value, or `defaultValue` when the response is empty and a default exists.
 */
export async function promptParameter(
    parameter: Partial<Parameter> & Pick<Parameter, "key">,
    defaultValue: string | undefined,
): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(promptText(parameter, defaultValue), (answer) => {
            rl.close();
            if (answer === "" && defaultValue !== undefined) {
                resolve(defaultValue);
            } else {
                resolve(answer);
            }
        });
    });
}
