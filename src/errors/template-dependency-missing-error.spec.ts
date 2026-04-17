import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { TemplateDependencyMissingError } =
        await import("./template-dependency-missing-error");
    const error = new TemplateDependencyMissingError({
        templateName: "template-name",
        templateVersion: "1.0.0",
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman template dependency is missing: "package.json" is missing the "template-name@1.0.0" dependency.</color>

      The "cloneman" field references the template "template-name" but the NPM dependency is missing.

      Install the dependency with:

        <cyan>npm install --save-dev --save-exact template-name@1.0.0</color>
    `);
});
