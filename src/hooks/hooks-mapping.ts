import { type BuildContext } from "./build-context";

/**
 * @internal
 */
export interface HookMapping {
    build(this: void, context: BuildContext): void | Promise<void>;
}
