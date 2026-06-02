import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { ParameterRequiredError } =
        await import("./parameter-required-error");
    const error = new ParameterRequiredError("owner");
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman: required parameter "owner" was not provided</color>

      Pass a value using the <cyan>--param owner=<value></color> option.
    `);
});
