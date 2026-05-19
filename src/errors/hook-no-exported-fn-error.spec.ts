import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message", async () => {
    expect.assertions(1);
    const { HookNoExportedFnError } =
        await import("./hook-no-exported-fn-error");
    const error = new HookNoExportedFnError({
        hookName: "build",
        scriptPath: "/path/to/build.mjs",
    });
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman cannot run hook "build": the script is not exporting a callback function.</color>

      The "build" hook at "/path/to/build.mjs" must either:

        - export a named function "build"
        - default export a function
    `);
});
