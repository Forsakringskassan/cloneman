import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { IgnoreFilesTrackedError } =
        await import("./ignore-files-tracked-error");
    const error = new IgnoreFilesTrackedError(["managed.txt", "src/config.ts"]);
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman cannot update: ignored files must not be tracked by Git.</color>

      These files match "cloneman.ignoreFiles" and are tracked by Git:

        - managed.txt
        - src/config.ts

      Remove these files from Git tracking before using "cloneman.ignoreFiles".
    `);
});
