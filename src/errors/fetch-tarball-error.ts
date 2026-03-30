/* eslint-disable sonarjs/no-nested-template-literals -- easier to read than breaking it out further */

import { styleText } from "node:util";
import { UserError } from "./user-error";

/**
 * @internal
 */
export class FetchTarballError extends UserError {
    private readonly spec: string;
    private readonly tarballUrl: string;
    private readonly statusCode: string;
    private readonly statusText: string;

    public constructor(
        spec: string,
        tarballUrl: string,
        statusCode: string,
        statusText: string,
    ) {
        super(`Failed to fetch tarball`);
        this.name = "FetchTarballError";
        this.spec = spec;
        this.tarballUrl = tarballUrl;
        this.statusCode = statusCode;
        this.statusText = statusText;
    }

    public override prettyMessage(): string {
        const { spec, tarballUrl, statusCode, statusText } = this;
        return [
            styleText(
                "red",
                `ERROR cloneman cannot update application: "Cannot fetch tarball"`,
            ),
            ``,
            `Tarball for template ${spec} could not be fetched from URL: ${styleText("cyan", tarballUrl)}`,
            ``,
            `HTTP status code: ${styleText("yellow", statusCode)}${statusText ? ` ${styleText("yellow", statusText)}` : ""}`,
            ``,
            `Make sure the template package and version are correct and that you have access to the npm registry.`,
        ].join("\n");
    }
}
