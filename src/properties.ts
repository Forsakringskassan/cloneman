/* Fields unique to each application and there for needs to be removed when creating template */
export const BUILD_REMOVE_FIELDS = ["repository"] as const;

/* Update should keep this values if they are present in the application package.json */
export const APPLICATION_OWNED_FIELDS = [
    "name",
    "version",
    "description",
    "author",
    "keywords",
    "bugs",
    "homepage",
    "repository",
] as const;

/* Current API version */
export const API_VERSION = 0;

/* Current Cloneman version */
export const CLONEMAN_VERSION: string = process.env["CLONEMAN_VERSION"] ?? "";
