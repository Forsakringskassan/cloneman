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

      How to fix it:
      1. Check out the branch where the update failed (for example, the Renovate pull request branch).
      2. Run <cyan>npx cloneman update 1.1.0</color> to update both the managed files and dependencies.

      Or, pin the NPM dependency to the matching version:

       <cyan>npm install --save-dev --save-exact template-name@1.1.0</color>

      3. Commit and push the changes to the same branch.
      $ git add -A && git commit --reset-author --amend --no-edit && git push --force-with-lease
      ---

      Template name: "template-name"
      Template version: "1.0.0"
      NPM Dependency version: "1.1.0"
    `);
});
