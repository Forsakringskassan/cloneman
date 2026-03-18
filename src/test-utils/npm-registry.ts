/* eslint-disable camelcase -- environment variables */

import fs from "node:fs/promises";
import { type Server } from "node:http";
import { type AddressInfo } from "node:net";
import path from "node:path";
import { type ConfigYaml } from "@verdaccio/types";
import { runServer } from "verdaccio";
import { temporaryDirectory } from "./temporary-directory";

const NPM_USERNAME = "integration";
const NPM_PASSWORD = "suchsecure";
const NPM_EMAIL = "integration@example.net";

const storage = temporaryDirectory();
const config: ConfigYaml = {
    storage,
    /* @ts-expect-error -- documentation says this should not be set in verdaccio v6 but it doesn't work without it (and the type definition disallows it) */
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
            access: ["$all"],
            publish: ["$all"],
        },
        "**": {
            access: ["$all"],
            publish: ["$all"],
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

function startVerdaccio(): Promise<Server> {
    return new Promise((resolve) => {
        return runServer(config).then((server: Server) => {
            server.listen(0, "127.0.0.1", () => {
                const addr = server.address() as AddressInfo;
                registryHost = `${addr.address}:${addr.port}`;
                registryUrl = `http://${registryHost}`;
                console.log({ registryHost, registryUrl });
                userEnv.npm_config_registry = registryUrl;
                authEnv.npm_config_registry = registryUrl;
                resolve(server);
            });
        });
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
    await fs.rm(storage, { recursive: true });
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
