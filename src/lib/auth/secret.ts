import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SECRET_PATH = path.join(process.cwd(), "data", ".session-secret");

function loadOrCreateSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;

  fs.mkdirSync(path.dirname(SECRET_PATH), { recursive: true });
  if (fs.existsSync(SECRET_PATH)) {
    return fs.readFileSync(SECRET_PATH, "utf-8").trim();
  }
  const secret = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(SECRET_PATH, secret, { mode: 0o600 });
  return secret;
}

declare global {
  var __kalanSessionSecret: string | undefined;
}

export const SESSION_SECRET = globalThis.__kalanSessionSecret ?? loadOrCreateSecret();

if (process.env.NODE_ENV !== "production") {
  globalThis.__kalanSessionSecret = SESSION_SECRET;
}
