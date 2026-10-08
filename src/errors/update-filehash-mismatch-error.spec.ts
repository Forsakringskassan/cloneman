import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { UpdateFilehashMismatchError } =
        await import("./update-filehash-mismatch-error");

    const error = new UpdateFilehashMismatchError({
        oldHash: "old-hash",
        newHash: "new-hash",
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman: Update task failed, Cannot update because the template's managed files have changed.</color>

      Why this happened:
      The template has changed since this branch was last fully updated.

      How to fix it:
      1. Check out the branch where the update failed (for example, the Renovate pull request branch).
      2. Run \`npx cloneman update\` to update both the managed files and dependencies.
      3. Commit and push the changes to the same branch.

      New hash does not match the expected old hash:
        Expected: "<yellow>old-hash</color>"
        Found:    "<yellow>new-hash</color>"
    `);
});
