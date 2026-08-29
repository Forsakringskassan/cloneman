---
name: api-documentation
description: "Write or update public API documentation. Use when documenting exported TypeScript APIs, adding or revising TSDoc, or updating docs/api reference pages."
argument-hint: "Describe the API or documentation change"
---

# API Documentation

Keep public TSDoc and readable API reference pages consistent.

## Scope

- Public APIs are exported from `src/index.ts`; reference pages are in `docs/api/`.
- Do not present unexported APIs as public unless they are intentional internal extension points.
- Name reference pages after their documented symbol in kebab-case, such as `build-context.md` for `BuildContext`.

## Workflow

1. Trace the requested export from `src/index.ts` to its owning declaration and read its current TSDoc and reference page.
2. Update TSDoc at the owning declaration with observable behavior, parameters, return values, relevant errors or side effects, and overload semantics.
3. Update the reference page. If it does not exist, ask before creating it, then start from [the API reference template](./template/interface.md).
4. For interfaces and classes, include the TSDoc-free TypeScript shape before member sections. Exclude `@internal` members; list properties alphabetically, then methods alphabetically.

## Writing Conventions

- Put each sentence of API documentation prose on its own line and preserve the existing Markdown and code-block style.
- Link a prose reference to any type that has an API reference page.
- Mark optional parameters and expanded properties with `(optional)`. When their default is known, add `Default \`${default}\`.` after the description.
- Expand locally defined object parameters as `object` plus dotted properties. Keep external and separately documented types named.
- Describe return values in prose: use `Returns` for synchronous values and `A promise resolved` for promises.
- Include an example for every property and method. Describe useful output, side effects, or value availability in prose below it or with a code comment.
- Use GitHub-flavored `[!TIP]` notes for helpful guidance and `[!CAUTION]` notes for errors, data loss, or security risks.

## Completion Checks

- TSDoc and relevant reference pages match the intended public signature and behavior.
- Page structure, links, parameter formatting, return descriptions, examples, and notes follow the conventions above.
- Format documentation-only changes with Prettier. Run relevant tests when behavior also changes.
