import fs from "node:fs/promises";
import path from "node:path";

await fs.writeFile(
    path.join(process.cwd(), "install.txt"),
    "install script at v1.0.0",
    "utf8",
);
