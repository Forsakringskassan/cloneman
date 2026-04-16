import { expect, it } from "vitest";
import { isClientMetadata } from "./is-client-metadata";

it("should return false for invalid values", () => {
    expect.assertions(6);
    expect(isClientMetadata(null)).toBe(false);
    expect(isClientMetadata(undefined)).toBe(false);
    expect(isClientMetadata(false)).toBe(false);
    expect(isClientMetadata(0)).toBe(false);
    expect(isClientMetadata(42)).toBe(false);
    expect(isClientMetadata("mock-pkg@1.0.0")).toBe(false);
});

it("should return false when fields are missing", () => {
    expect.assertions(3);
    expect(isClientMetadata({})).toBe(false);
    expect(isClientMetadata({ version: "1.0.0" })).toBe(false);
    expect(isClientMetadata({ template: "mock-pkg" })).toBe(false);
});

it("should return false when template is not a string", () => {
    expect.assertions(1);
    expect(isClientMetadata({ template: 1, version: "1.0.0" })).toBe(false);
});

it("should return false when version is not a string", () => {
    expect.assertions(1);
    expect(isClientMetadata({ template: "mock-pkg", version: 1 })).toBe(false);
});

it("should return false when template is an empty string", () => {
    expect.assertions(2);
    expect(isClientMetadata({ template: "", version: "1.0.0" })).toBe(false);
    expect(isClientMetadata({ template: " ", version: "1.0.0" })).toBe(false);
});

it("should return false when version is an empty string", () => {
    expect.assertions(2);
    expect(isClientMetadata({ template: "mock-pkg", version: "" })).toBe(false);
    expect(isClientMetadata({ template: "mock-pkg", version: " " })).toBe(
        false,
    );
});

it("should return true for a valid object", () => {
    expect.assertions(1);
    expect(isClientMetadata({ template: "mock-pkg", version: "1.0.0" })).toBe(
        true,
    );
});
