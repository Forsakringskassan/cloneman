import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { NoApplicationFolderError } =
        await import("./no-application-folder-error");
    const error = new NoApplicationFolderError();
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cannot read package.json.</color>

      Make sure you are running the command in the root of your application.
    `);
});
