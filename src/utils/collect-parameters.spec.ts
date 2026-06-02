import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ParameterInvalidPatternError,
    ParameterRequiredError,
    ParameterValidationError,
} from "../errors";
import { type Parameter } from "../types";
import { collectParameters, valueMatches } from "./collect-parameters";
import { promptParameter } from "./prompt-parameter";

vi.mock(import("./prompt-parameter"), () => ({
    promptParameter: vi.fn(),
}));

function defineParameter(
    parameter: Pick<Parameter, "key"> & Partial<Parameter>,
): Parameter {
    return {
        required: false,
        description: `${parameter.key} description`,
        help: null,
        ...parameter,
    };
}

describe("valueMatches()", () => {
    it("should match entire string", () => {
        expect.assertions(3);
        const parameter = {
            key: "mock-key",
            pattern: "foo",
        };
        expect(valueMatches(parameter, "foo")).toBeTruthy();
        expect(valueMatches(parameter, "foobar")).toBeFalsy();
        expect(valueMatches(parameter, "barfoo")).toBeFalsy();
    });

    it("should match as regular expression", () => {
        expect.assertions(3);
        const parameter = {
            key: "mock-key",
            pattern: "abc?",
        };
        expect(valueMatches(parameter, "ab")).toBeTruthy();
        expect(valueMatches(parameter, "abc")).toBeTruthy();
        expect(valueMatches(parameter, "abcd")).toBeFalsy();
    });

    it("should match pattern with alternation", () => {
        expect.assertions(4);
        const parameter = {
            key: "mock-key",
            pattern: "foo|bar",
        };
        expect(valueMatches(parameter, "foo")).toBeTruthy();
        expect(valueMatches(parameter, "bar")).toBeTruthy();
        expect(valueMatches(parameter, "foobar")).toBeFalsy();
        expect(valueMatches(parameter, "barfoo")).toBeFalsy();
    });
});

describe("collectParameters()", () => {
    it("should return empty object when there are no definitions", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [],
            existing: new Map(),
            overrides: new Map(),
            interactive: false,
        });
        expect(result).toEqual(new Map());
    });

    it("should use override over existing value", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [
                defineParameter({
                    key: "foo",
                }),
            ],
            existing: new Map([["foo", "existing"]]),
            overrides: new Map([["foo", "override"]]),
            interactive: false,
        });
        expect(result).toEqual(new Map([["foo", "override"]]));
    });

    it("should use existing value when no override is present", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [
                defineParameter({
                    key: "foo",
                }),
            ],
            existing: new Map([["foo", "existing"]]),
            overrides: new Map(),
            interactive: false,
        });
        expect(result).toEqual(new Map([["foo", "existing"]]));
    });

    it("should set optional parameters with no value to default value", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [
                defineParameter({
                    key: "foo",
                    required: false,
                    defaultValue: "default value",
                }),
                defineParameter({
                    key: "bar",
                    required: false,
                }),
            ],
            existing: new Map(),
            overrides: new Map(),
            interactive: false,
        });
        expect(result).toEqual(
            new Map([
                ["foo", "default value"],
                ["bar", ""],
            ]),
        );
    });

    it("should handle optional parameter with existing empty string", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [
                defineParameter({
                    key: "foo",
                    required: false,
                }),
            ],
            existing: new Map([["foo", ""]]),
            overrides: new Map(),
            interactive: false,
        });
        expect(result).toEqual(new Map([["foo", ""]]));
    });

    it("should handle optional parameter with override empty string", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [
                defineParameter({
                    key: "foo",
                    required: false,
                }),
            ],
            existing: new Map(),
            overrides: new Map([["foo", ""]]),
            interactive: false,
        });
        expect(result).toEqual(new Map([["foo", ""]]));
    });

    it("should throw ParameterRequiredError for required parameter with no value", async () => {
        expect.assertions(1);
        await expect(
            collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                        required: true,
                    }),
                ],
                existing: new Map(),
                overrides: new Map(),
                interactive: false,
            }),
        ).rejects.toThrow(ParameterRequiredError);
    });

    it("should throw ParameterValidationError when value does not match pattern", async () => {
        expect.assertions(1);
        await expect(
            collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                        pattern: "[a-z]+",
                    }),
                ],
                existing: new Map(),
                overrides: new Map([["foo", "INVALID"]]),
                interactive: false,
            }),
        ).rejects.toThrow(ParameterValidationError);
    });

    it("should throw ParameterInvalidPatternError for parameter with invalid regular expression", async () => {
        expect.assertions(1);
        await expect(
            collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                        required: true,
                        pattern: "foo(bar",
                    }),
                ],
                existing: new Map([["foo", "bar"]]),
                overrides: new Map(),
                interactive: false,
            }),
        ).rejects.toThrow(ParameterInvalidPatternError);
    });

    it("should accept value matching pattern", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [
                defineParameter({
                    key: "foo",
                    pattern: "[a-z]+",
                }),
            ],
            existing: new Map(),
            overrides: new Map([["foo", "valid"]]),
            interactive: false,
        });
        expect(result).toEqual(new Map([["foo", "valid"]]));
    });

    it("should validate existing value against pattern", async () => {
        expect.assertions(1);
        await expect(
            collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                        pattern: "[a-z]+",
                    }),
                ],
                existing: new Map([["foo", "INVALID"]]),
                overrides: new Map(),
                interactive: false,
            }),
        ).rejects.toThrow(ParameterValidationError);
    });

    it("should validate override value against pattern", async () => {
        expect.assertions(1);
        await expect(
            collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                        pattern: "[a-z]+",
                    }),
                ],
                existing: new Map(),
                overrides: new Map([["foo", "INVALID"]]),
                interactive: false,
            }),
        ).rejects.toThrow(ParameterValidationError);
    });

    it("should use defaultValue when no existing value is present", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [
                defineParameter({
                    key: "foo",
                    defaultValue: "default",
                }),
            ],
            existing: new Map(),
            overrides: new Map(),
            interactive: false,
        });
        expect(result).toEqual(new Map([["foo", "default"]]));
    });

    it("should prefer existing value over defaultValue", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [
                defineParameter({
                    key: "foo",
                    defaultValue: "default",
                }),
            ],
            existing: new Map([["foo", "existing"]]),
            overrides: new Map(),
            interactive: false,
        });
        expect(result).toEqual(new Map([["foo", "existing"]]));
    });

    it("should prefer override over defaultValue", async () => {
        expect.assertions(1);
        const result = await collectParameters({
            definitions: [
                defineParameter({
                    key: "foo",
                    defaultValue: "default",
                }),
            ],
            existing: new Map(),
            overrides: new Map([["foo", "override"]]),
            interactive: false,
        });
        expect(result).toEqual(new Map([["foo", "override"]]));
    });

    describe("interactive mode", () => {
        beforeEach(() => {
            vi.mocked(promptParameter).mockReset();
        });

        it("should prompt for missing value", async () => {
            expect.assertions(1);
            vi.mocked(promptParameter).mockResolvedValue("prompted");
            const result = await collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                    }),
                ],
                existing: new Map(),
                overrides: new Map(),
                interactive: true,
            });
            expect(result).toEqual(new Map([["foo", "prompted"]]));
        });

        it("should pass existing value as default to the prompt", async () => {
            expect.assertions(1);
            vi.mocked(promptParameter).mockResolvedValue("existing");
            await collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                    }),
                ],
                existing: new Map([["foo", "existing"]]),
                overrides: new Map(),
                interactive: true,
            });
            expect(promptParameter).toHaveBeenCalledWith(
                {
                    key: "foo",
                    required: false,
                    description: "foo description",
                    help: null,
                },
                "existing",
            );
        });

        it("should pass defaultValue as prompt default when no existing value", async () => {
            expect.assertions(1);
            vi.mocked(promptParameter).mockResolvedValue("default");
            await collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                        defaultValue: "default",
                    }),
                ],
                existing: new Map(),
                overrides: new Map(),
                interactive: true,
            });
            expect(promptParameter).toHaveBeenCalledWith(
                {
                    key: "foo",
                    required: false,
                    description: "foo description",
                    help: null,
                    defaultValue: "default",
                },
                "default",
            );
        });

        it("should prefer existing value over defaultValue for prompt default", async () => {
            expect.assertions(1);
            vi.mocked(promptParameter).mockResolvedValue("existing");
            await collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                        defaultValue: "default",
                    }),
                ],
                existing: new Map([["foo", "existing"]]),
                overrides: new Map(),
                interactive: true,
            });
            expect(promptParameter).toHaveBeenCalledWith(
                {
                    key: "foo",
                    required: false,
                    description: "foo description",
                    help: null,
                    defaultValue: "default",
                },
                "existing",
            );
        });

        it("should throw ParameterRequiredError when prompt returns empty for required param", async () => {
            expect.assertions(1);
            vi.mocked(promptParameter).mockResolvedValue("");
            await expect(
                collectParameters({
                    definitions: [
                        defineParameter({
                            key: "foo",
                            required: true,
                        }),
                    ],
                    existing: new Map(),
                    overrides: new Map(),
                    interactive: true,
                }),
            ).rejects.toThrow(ParameterRequiredError);
        });

        it("should not prompt when an override is available", async () => {
            expect.assertions(2);
            const result = await collectParameters({
                definitions: [
                    defineParameter({
                        key: "foo",
                    }),
                ],
                existing: new Map(),
                overrides: new Map([["foo", "override"]]),
                interactive: true,
            });
            expect(result).toEqual(new Map([["foo", "override"]]));
            expect(promptParameter).not.toHaveBeenCalled();
        });
    });
});
