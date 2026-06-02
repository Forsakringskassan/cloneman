import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { ParameterInvalidKeyError } =
        await import("./parameter-invalid-key-error");
    const error = new ParameterInvalidKeyError({ key: "foobar" });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman: invalid parameter key "foobar".</color>

      This is an error in the template "build" hook.

      Ensure each \`template.addParameter()\` call uses a key that is one or more characters and consist only of:

        - 0-9
        - a-z
        - hyphen
    `);
});
