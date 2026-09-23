import { expect, inject, it, vi } from "vitest";

import { getTemplateParams } from "./get-template-params";

const userEnv = inject("userEnv");

/*
Increased timeout time since test involves a lot fetching data from NPM Registry
*/
vi.setConfig({ testTimeout: 10_000 });

it("should get parameters for package", async () => {
    expect.assertions(1);

    const result = await getTemplateParams({
        packageName: "@forsakringskassan/with-parameters-template",
        env: userEnv,
    });

    expect(result).toMatchInlineSnapshot(
        `
      [
        {
          "description": "Repository url",
          "help": "This should be a valid URL to a Git repository",
          "key": "repository",
          "pattern": "git[+]https://.+",
          "required": true,
        },
        {
          "defaultValue": "Awesome project",
          "description": "Project description",
          "help": null,
          "key": "description",
          "required": false,
        },
      ]
    `,
    );
});

it("should return empty list if no params found", async () => {
    expect.assertions(1);

    const result = await getTemplateParams({
        packageName: "@forsakringskassan/base-template",
        env: userEnv,
    });

    expect(result).toEqual([]);
});
