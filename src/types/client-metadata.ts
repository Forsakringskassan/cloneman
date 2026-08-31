/**
 * The metadata object written to the users application `package.json` by cloneman.
 *
 * @internal
 */
export interface ClientMetadata {
    /** The name of the cloneman template used by this application. */
    readonly template: string;
    /** The version of the cloneman template last used to create/update this application. */
    readonly version: string;
    /** Latest acknowledged SHA-256 hash of the managed template files used to create/update this application. */
    readonly fileHash: string;
    /** Parameter values collected from the user. */
    readonly parameters?: Record<string, string>;
}
