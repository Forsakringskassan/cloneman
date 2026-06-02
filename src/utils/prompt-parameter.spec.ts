import prettyAnsi from "pretty-ansi";
import { expect, it, vi } from "vitest";
import { type Parameter } from "../types";
import { promptText } from "./prompt-parameter";

vi.mock(import("node:util"), async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        styleText(format, text, options) {
            return original.styleText(format, text, {
                ...options,
                validateStream: false,
            });
        },
    };
});

expect.addSnapshotSerializer({
    test(val) {
        return typeof val === "string";
    },
    serialize(text) {
        return prettyAnsi(String(text));
    },
});

it("should format prompt", () => {
    expect.assertions(1);
    const parameter = {
        key: "mock-parameter",
        description: "Mock description",
        help: `Additional help for this parameter`,
    } satisfies Partial<Parameter>;
    const text = promptText(parameter, "mock default value");
    expect(text).toMatchInlineSnapshot(`
      Mock description
      <dim>╵</intensity> Additional help for this parameter
      [<dim>mock default value</intensity>] ?
    `);
});

it("should format prompt without help", () => {
    expect.assertions(1);
    const parameter = {
        key: "mock-parameter",
        description: "Mock description",
    } satisfies Partial<Parameter>;
    const text = promptText(parameter, "mock default value");
    expect(text).toMatchInlineSnapshot(
        `Mock description [<dim>mock default value</intensity>] ?`,
    );
});

it("should format prompt without default value", () => {
    expect.assertions(1);
    const parameter = {
        key: "mock-parameter",
        description: "Mock description",
        help: `Additional help for this parameter`,
    } satisfies Partial<Parameter>;
    const text = promptText(parameter, undefined);
    expect(text).toMatchInlineSnapshot(`
      Mock description
      <dim>╵</intensity> Additional help for this parameter
      ?
    `);
});

it("should format prompt without help or default value", () => {
    expect.assertions(1);
    const parameter = {
        key: "mock-parameter",
        description: "Mock description",
    } satisfies Partial<Parameter>;
    const text = promptText(parameter, undefined);
    expect(text).toMatchInlineSnapshot(`Mock description ?`);
});

it("should format with multiline help (no trailing newline)", () => {
    expect.assertions(1);
    const parameter = {
        key: "mock-parameter",
        description: "Mock description",
        help: ["line 1", "line 2", "line 3"].join("\n"),
    } satisfies Partial<Parameter>;
    const text = promptText(parameter, undefined);
    expect(text).toMatchInlineSnapshot(`
      Mock description
      <dim>│</intensity> line 1
      <dim>│</intensity> line 2
      <dim>╵</intensity> line 3
      ?
    `);
});

it("should format with multiline help (with trailing newline)", () => {
    expect.assertions(1);
    const parameter = {
        key: "mock-parameter",
        description: "Mock description",
        help: ["line 1\n", "line 2\n", "line 3\n"].join(""),
    } satisfies Partial<Parameter>;
    const text = promptText(parameter, undefined);
    expect(text).toMatchInlineSnapshot(`
      Mock description
      <dim>│</intensity> line 1
      <dim>│</intensity> line 2
      <dim>╵</intensity> line 3
      ?
    `);
});

it("should fallback on key when description is missing", () => {
    expect.assertions(1);
    const parameter = {
        key: "mock-parameter",
    } satisfies Partial<Parameter>;
    const text = promptText(parameter, "mock default value");
    expect(text).toMatchInlineSnapshot(
        `mock-parameter [<dim>mock default value</intensity>] ?`,
    );
});
