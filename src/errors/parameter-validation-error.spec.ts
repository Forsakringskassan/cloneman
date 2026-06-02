import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { ParameterValidationError } =
        await import("./parameter-validation-error");
    const error = new ParameterValidationError({
        parameter: "repo",
        value: "INVALID",
        pattern: "^[a-z]+$",
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman: value for parameter "repo" does not match required pattern</color>

        Value:   "<yellow>INVALID</color>"
        Pattern: "<yellow>^[a-z]+$</color>"
    `);
});
