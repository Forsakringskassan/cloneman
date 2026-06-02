import { expect, it } from "vitest";
import { type Parameter } from "../types";
import "./test-environment";

function generateError(pattern: string): Error | null {
    try {
        /* eslint-disable-next-line no-new -- want this for the throw error only */
        new RegExp(pattern);
    } catch (err) {
        return err instanceof Error ? err : null;
    }
    return null;
}

it("should format pretty message", async () => {
    expect.assertions(1);
    const { ParameterInvalidPatternError } =
        await import("./parameter-invalid-pattern-error");
    const parameter = {
        key: "my-parameter",
        description: "My parameter",
        help: null,
        required: false,
        pattern: "foo-(bar",
    } satisfies Parameter;
    const exception = generateError(parameter.pattern);
    const error = new ParameterInvalidPatternError(parameter, {
        cause: exception,
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman: pattern "foo-(bar" for parameter "my-parameter" is not a valid regular expression</color>

      This is an error in the template "build" hook.

      Ensure the \`template.addParameter()\` call uses a valid regular expression:

        template.addParameter("my-parameter", {
          pattern: "foo-(bar",
                    <red>^^^^^^^^</color> <magenta>Invalid regular expression: /foo-(bar/: Unterminated group</color>
        });
    `);
});

it("should handle missing cause", async () => {
    expect.assertions(1);
    const { ParameterInvalidPatternError } =
        await import("./parameter-invalid-pattern-error");
    const parameter = {
        key: "my-parameter",
        description: "My parameter",
        help: null,
        required: false,
        pattern: "foo-(bar",
    } satisfies Parameter;
    const error = new ParameterInvalidPatternError(parameter);
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman: pattern "foo-(bar" for parameter "my-parameter" is not a valid regular expression</color>

      This is an error in the template "build" hook.

      Ensure the \`template.addParameter()\` call uses a valid regular expression:

        template.addParameter("my-parameter", {
          pattern: "foo-(bar",
                    <red>^^^^^^^^</color>
        });
    `);
});
