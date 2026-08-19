import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { ManagedFileMissingError } =
        await import("./managed-file-missing-error");
    const error = new ManagedFileMissingError({
        templateName: "template-name",
        file: "foo.json",
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman cannot build template "template-name": managed file is missing.</color>

      The file "foo.json" is listed in "managedFiles" but does not exist in the template.

      Make sure the file exists or remove it from "managedFiles".
    `);
});
