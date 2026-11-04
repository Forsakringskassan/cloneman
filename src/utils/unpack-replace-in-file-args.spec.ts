import { describe, expect, it } from "vitest";
import { unpackReplaceInFileArgs } from "./unpack-replace-in-file-args";

describe("unpackReplaceInFileArgs()", () => {
    it("unpacks pattern and replacement", () => {
        expect.assertions(1);
        expect(unpackReplaceInFileArgs(["foo", "bar"])).toEqual({
            match: undefined,
            pattern: "foo",
            replacement: "bar",
            graceful: undefined,
        });
    });

    it("unpacks matcher with the matcher overload", () => {
        expect.assertions(1);
        const matcher = /^prefix:/;

        expect(unpackReplaceInFileArgs([matcher, "foo", "bar"])).toEqual({
            match: matcher,
            pattern: "foo",
            replacement: "bar",
            graceful: undefined,
        });
    });

    it("unpacks graceful option", () => {
        expect.assertions(1);
        expect(
            unpackReplaceInFileArgs(["foo", "bar", { graceful: true }]),
        ).toEqual({
            match: undefined,
            pattern: "foo",
            replacement: "bar",
            graceful: true,
        });
    });

    it("unpacks matcher and graceful option together", () => {
        expect.assertions(1);
        const matcher = /^prefix:/;

        expect(
            unpackReplaceInFileArgs([
                matcher,
                "foo",
                "bar",
                { graceful: true },
            ]),
        ).toEqual({
            match: matcher,
            pattern: "foo",
            replacement: "bar",
            graceful: true,
        });
    });
});
