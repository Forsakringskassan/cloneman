import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { TemplateFileHashMismatchError } =
        await import("./template-file-hash-mismatch-error");
    const error = new TemplateFileHashMismatchError({
        templateName: "template-name",
        templateVersion: "1.0.0",
        currentFileHash: "current-hash",
        expectedFileHash: "expected-hash",
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman application is not up-to-date: managed template files differ from the installed template version.</color>

      Template name: "template-name"
      Template version: "1.0.0"
      Current managed-file hash: "current-hash"
      Expected managed-file hash: "expected-hash"

      To update the application use the "update" command:

        <cyan>npx cloneman update "1.0.0"</color>
    `);
});
