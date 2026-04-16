import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { InvalidClonemanFieldError } =
        await import("./invalid-cloneman-field-error");
    const error = new InvalidClonemanFieldError(["foo", "bar"]);
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman cannot update application: "package.json" has invalid "cloneman" field.</color>

      The "cloneman" field is expected to be an object with the template and version fields but was actually: [ 'foo', 'bar' ].

      Make sure this application uses cloneman to manage the template.

      To create a new application from a template use the "create" command:

        <cyan>npx cloneman create "..."</color>

      To migrate an existing application to use a template use the "migrate" command:

        <cyan>npx cloneman migrate "..."</color>
    `);
});

it("should handle empty string", async () => {
    expect.assertions(1);
    const { InvalidClonemanFieldError } =
        await import("./invalid-cloneman-field-error");
    const error = new InvalidClonemanFieldError("");
    expect(error.prettyMessage()).toContain(
        `The "cloneman" field is expected to be an object with the template and version fields but was actually: ''.`,
    );
});

it("should handle whitespace", async () => {
    expect.assertions(1);
    const { InvalidClonemanFieldError } =
        await import("./invalid-cloneman-field-error");
    const error = new InvalidClonemanFieldError("    ");
    expect(error.prettyMessage()).toContain(
        `The "cloneman" field is expected to be an object with the template and version fields but was actually: '    '.`,
    );
});
