declare module "vitest" {
    export interface ProvidedContext {
        userEnv: Record<string, string>;
        authEnv: Record<string, string>;
        npmrc: string;
    }
}

export {};
