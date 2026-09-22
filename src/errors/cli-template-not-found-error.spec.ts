import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { CliTemplateNotFoundError } =
        await import("./cli-template-not-found-error");
    const error = new CliTemplateNotFoundError({
        templateName: "awesome-template",
        summary: "404 not found",
        argv: ["migrate", "awesome-template"],
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman cannot find the template "awesome-template": 404 not found.</color>

      $ cloneman migrate awesome-template
                         ^^^^^^^^^^^^^^^^

      Make sure the NPM package exists and you have permission to access it.
    `);
});
