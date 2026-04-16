import { type ClientMetadata } from "../types";

/**
 * @internal
 */
export function isClientMetadata(value: unknown): value is ClientMetadata {
    if (!value || typeof value !== "object") {
        return false;
    }
    if (!("template" in value) || !("version" in value)) {
        return false;
    }
    if (typeof value.template !== "string" || value.template.trim() === "") {
        return false;
    }
    if (typeof value.version !== "string" || value.version.trim() === "") {
        return false;
    }
    return true;
}
