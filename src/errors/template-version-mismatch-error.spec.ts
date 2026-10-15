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
        isRenovateBranch: false,
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman template version mismatch: the application was last updated with a different template version than the one specified in package.json.</color>

      How to fix it:
       1. Check out the branch where the update failed.
       2. Run <cyan>npx cloneman update 1.1.0</color> to update both the managed files and dependencies.

       To lock the dependency to the template version currently used by your application:

       <cyan>npm install --save-dev --save-exact template-name@1.0.0</color>

       3. Commit and push the changes to the same branch.
      ---
      Debug:
       Template name: "template-name"
       Application last updated with template version: "1.0.0"
       Template dependency version in package.json: "1.1.0"
    `);
});

it("should format pretty message for renovate branch", async () => {
    expect.assertions(1);
    const { TemplateVersionMismatchError } =
        await import("./template-version-mismatch-error");
    const error = new TemplateVersionMismatchError({
        templateName: "template-name",
        templateVersion: "1.0.0",
        dependencyVersion: "1.1.0",
        isRenovateBranch: true,
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman template version mismatch: the application was last updated with a different template version than the one specified in package.json.</color>

      How to fix it:
       1. Check out the branch where the update failed (the Renovate pull request branch).
       2. Run <cyan>npx cloneman update 1.1.0</color> to update both the managed files and dependencies.
       3. Commit and push the changes to this branch.
        $ git add -A && git commit --reset-author --amend --no-edit && git push --force-with-lease
      ---
      Debug:
       Template name: "template-name"
       Application last updated with template version: "1.0.0"
       Template dependency version in package.json: "1.1.0"
    `);
});
