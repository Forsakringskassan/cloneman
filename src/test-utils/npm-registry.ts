/* eslint-disable @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/prefer-promise-reject-errors, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-deprecated , @typescript-eslint/no-unsafe-argument, camelcase -- technical debt */

import fs from "node:fs/promises";
import { type Server } from "node:http";
import path from "node:path";
import { startVerdaccio as startServer } from "verdaccio";
import { temporaryDirectory } from "./temporary-directory";

const NPM_USERNAME = "integration";
const NPM_PASSWORD = "suchsecure"; // eslint-disable-line sonarjs/no-hardcoded-passwords -- for test cases only
const NPM_EMAIL = "integration@example.net";

const storage = temporaryDirectory();
const config = {
    storage,
    self_path: import.meta.dirname,
    auth: {
        htpasswd: {
            file: path.join(storage, "htpasswd"),
            algorithm: "bcrypt",
        },
    },
    uplinks: {},
    packages: {
        "@*/*": {
            access: "$all",
            publish: "$all",
        },
        "**": {
            access: "$all",
            publish: "$all",
        },
    },
    log: { type: "stdout", format: "pretty", level: "error" },
};

const userEnv = {
    npm_config_registry: "",
};

const authEnv = {
    npm_config_registry: "",
    NPM_USERNAME,
    NPM_PASSWORD,
    NPM_EMAIL,
    NPM_TOKEN: "",
};

let server: Server | null = null;
let registryHost: string = "";
let registryUrl: string = "";

/* eslint-disable-next-line sonarjs/pseudo-random -- for testing */
const port = Math.ceil(Math.random() * 50000 + 5000);

function startVerdaccio(): Promise<Server> {
    return new Promise((resolve, reject) => {
        try {
            startServer(
                config,
                port as any,
                {} as any,
                "1.0.0",
                "verdaccio",
                (webServer: any, addr: any) => {
                    webServer.listen(addr.port || addr.path, addr.host, () => {
                        registryHost = `${addr.host}:${addr.port}`;
                        registryUrl = `${addr.proto}://${registryHost}`;
                        userEnv.npm_config_registry = registryUrl;
                        authEnv.npm_config_registry = registryUrl;
                        resolve(webServer);
                    });
                },
            );
        } catch (error) {
            reject(error);
        }
    });
}

async function registerUser(
    username: string,
    password: string,
    email: string,
): Promise<void> {
    const response = await fetch(
        `${registryUrl}/-/user/org.couchdb.user:${username}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                _id: `org.couchdb.user:${username}`,
                name: username,
                roles: [],
                type: "user",
                password,
                email,
            }),
        },
    );
    if (!response.ok) {
        throw new Error(`Failed to register user "${username}"`);
    }
}

interface TokenResponse {
    token: string;
    user: string;
    key: string;
    cidr: string[];
    readonly: boolean;
    created: string;
}

async function getUserToken(
    username: string,
    password: string,
): Promise<TokenResponse> {
    const authToken = Buffer.from(`${username}:${password}`).toString("base64");
    const response = await fetch(`${registryUrl}/-/npm/v1/tokens`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${authToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, readonly: false, cidr_whitelist: [] }),
    });
    if (!response.ok) {
        throw new Error(`Failed to get NPM token for user "${username}"`);
    }
    return (await response.json()) as TokenResponse;
}

export async function start(): Promise<typeof authEnv> {
    if (server) {
        throw new Error("server already started");
    }

    server = await startVerdaccio();

    await registerUser(NPM_USERNAME, NPM_PASSWORD, NPM_EMAIL);
    const { token } = await getUserToken(NPM_USERNAME, NPM_PASSWORD);
    authEnv.NPM_TOKEN = token;

    return authEnv;
}

export async function stop(): Promise<void> {
    await fs.rm(config.storage, { recursive: true });
    return new Promise((resolve, reject) => {
        if (server) {
            server.close((error?: Error | null) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
            server = null;
        } else {
            resolve();
        }
    });
}

export function getAuthToken(): string {
    return authEnv.NPM_TOKEN;
}

export function getRegistryHost(): string {
    return registryHost;
}

export function getUserEnv(): typeof userEnv {
    return Object.freeze({ ...userEnv });
}

export function getAuthEnv(): typeof authEnv {
    return Object.freeze({ ...authEnv });
}
