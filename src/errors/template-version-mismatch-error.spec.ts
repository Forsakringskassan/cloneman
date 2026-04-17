import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { TemplateVersionMismatchError } =
        await import("./template-version-mismatch-error");
    const error = new TemplateVersionMismatchError({
        templateName: "template-name",
        templateVersion: "1.0.0",
        dependencyVersion: "1.1.0",
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman application is not up-to-date: the application is generated from a different version than NPM dependency.</color>

      Template name: "template-name"
      Template version: "1.0.0"
      NPM Dependency version: "1.1.0"

      To update the application use the "update" command:

        <cyan>npx cloneman update "1.1.0"</color>

      Or, pin the NPM dependency to the matching version:

        <cyan>npm install --save-dev --save-exact template-name@1.1.0</color>
    `);
});
