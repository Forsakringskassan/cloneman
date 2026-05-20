import { type BuildContext } from "./build-context";
import { type InstallContext } from "./install-context";

/**
 * @internal
 */
export interface HookMapping {
    build(this: void, context: BuildContext): void | Promise<void>;
    install(this: void, context: InstallContext): void | Promise<void>;
}
