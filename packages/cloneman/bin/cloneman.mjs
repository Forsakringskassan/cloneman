#!/usr/bin/env node

import { cli } from "../dist/cli.mjs";

const cwd = process.cwd();
const args = process.argv.slice(2);
await cli(cwd, args);
