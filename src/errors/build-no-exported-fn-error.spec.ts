import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { BuildNoExportedFnError } =
        await import("./build-no-exported-fn-error");
    const error = new BuildNoExportedFnError({
        scriptPath: "/path/to/build.mjs",
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman cannot compile template: the build script is not exporting a callback function.</color>

      The build script at "/path/to/build.mjs" must either:

        - export a named function "build"
        - default export a function
    `);
});
