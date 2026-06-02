import { expect, it } from "vitest";
import { parseParams } from "./parse-params";

it("returns an empty map for an empty array", () => {
    expect.assertions(1);
    expect(parseParams([])).toEqual(new Map());
});

it("parses a single key=value pair", () => {
    expect.assertions(1);
    expect(parseParams(["key=value"])).toEqual(new Map([["key", "value"]]));
});

it("parses multiple key=value pairs", () => {
    expect.assertions(1);
    expect(parseParams(["foo=bar", "baz=qux"])).toEqual(
        new Map([
            ["foo", "bar"],
            ["baz", "qux"],
        ]),
    );
});

it("allows an empty value", () => {
    expect.assertions(1);
    expect(parseParams(["key="])).toEqual(new Map([["key", ""]]));
});

it("preserves value that contains an equals sign", () => {
    expect.assertions(1);
    expect(parseParams(["key=a=b"])).toEqual(new Map([["key", "a=b"]]));
});

it("throws for a param without an equals sign", () => {
    expect.assertions(1);
    expect(() => parseParams(["invalid"])).toThrow(
        `Invalid --param "invalid": invalid format (expected "key=value")`,
    );
});

it("throws for a param without key", () => {
    expect.assertions(1);
    expect(() => parseParams(["=value"])).toThrow(
        `Invalid --param "=value": key missing (expected "key=value")`,
    );
});
