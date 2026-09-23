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
      <red>ERROR cloneman: Update task failed, new hash does not match the expected old hash</color>

        Old Hash: "<yellow>old-hash</color>"
        New Hash: "<yellow>new-hash</color>"
      The template's managed files have changed between versions. A full update is required
      Run npx cloneman update
    `);
});
