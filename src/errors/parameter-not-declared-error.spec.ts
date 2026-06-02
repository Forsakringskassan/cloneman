import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { ParameterNotDeclaredError } =
        await import("./parameter-not-declared-error");
    const error = new ParameterNotDeclaredError({
        hook: "install",
        parameter: "foobar",
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman: parameter "foobar" was referenced in hook "install" but was not declared.</color>

      This is an error in the template. Please report it to the template maintainer.
      The parameter must be declared in the build hook using <cyan>template.addParameter("foobar", { ... })</color>
    `);
});
