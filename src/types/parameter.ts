/**
 * Defines a parameter that a template requires from the user.
 *
 * @public
 * @since %version%
 */
export interface Parameter {
    /**
     * Unique identifier for the parameter. Key must be `[\da-z-]+`.
     */
    readonly key: string;

    /**
     * Human-readable description shown to the user when prompting for input.
     */
    readonly description: string;

    /**
     * Optional help text shown with the parameter.
     */
    readonly help: string | null;

    /**
     * When `true`, the user must provide a non-empty value.
     */
    readonly required: boolean;

    /**
     * When set, this is used as the default value when no previous value exists.
     */
    readonly defaultValue?: string;

    /**
     * Optional regular expression used to validate the user value.
     */
    readonly pattern?: string;
}
