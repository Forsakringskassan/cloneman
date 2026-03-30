import { expect, it } from "vitest";
import "./test-environment";

it("should format pretty message with status text", async () => {
    expect.assertions(1);
    const { FetchTarballError } = await import("./fetch-tarball-error");
    const error = new FetchTarballError(
        "my-template@1.0.0",
        "https://registry.npmjs.org/my-template/-/my-template-1.0.0.tgz",
        "404",
        "Not Found",
    );
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman cannot update application: "Cannot fetch tarball"</color>

      Tarball for template my-template@1.0.0 could not be fetched from URL: <cyan>https://registry.npmjs.org/my-template/-/my-template-1.0.0.tgz</color>

      HTTP status code: <yellow>404</color> <yellow>Not Found</color>

      Make sure the template package and version are correct and that you have access to the npm registry.
    `);
});

it("should format pretty message without status text", async () => {
    expect.assertions(1);
    const { FetchTarballError } = await import("./fetch-tarball-error");
    const error = new FetchTarballError(
        "my-template@1.0.0",
        "https://registry.npmjs.org/my-template/-/my-template-1.0.0.tgz",
        "404",
        "",
    );
    expect(error.prettyMessage()).toMatchInlineSnapshot(`
      <red>ERROR cloneman cannot update application: "Cannot fetch tarball"</color>

      Tarball for template my-template@1.0.0 could not be fetched from URL: <cyan>https://registry.npmjs.org/my-template/-/my-template-1.0.0.tgz</color>

      HTTP status code: <yellow>404</color>

      Make sure the template package and version are correct and that you have access to the npm registry.
    `);
});
