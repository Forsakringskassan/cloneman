import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { MissingClonemanFieldError } =
        await import("./missing-cloneman-field-error");
    const error = new MissingClonemanFieldError();
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman cannot update application: "package.json" is missing the required "cloneman" field.</color>

      Make sure this application uses cloneman to manage the template.

      To create a new application from a template use the "create" command:

        <cyan>npx cloneman create "..."</color>

      To migrate an existing application to use a template use the "migrate" command:

        <cyan>npx cloneman migrate "..."</color>
    `);
});
