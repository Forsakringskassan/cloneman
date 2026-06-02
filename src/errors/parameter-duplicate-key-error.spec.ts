import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { ParameterDuplicateKeyError } =
        await import("./parameter-duplicate-key-error");
    const error = new ParameterDuplicateKeyError({ key: "foobar" });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman: duplicate parameter key "foobar".</color>

      This is an error in the template "build" hook.

      Ensure each \`template.addParameter()\` call uses a unique key.
    `);
});
