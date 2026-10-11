import "server-only";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  if (derivedKey.length !== keyBuffer.length) return false;
  return timingSafeEqual(derivedKey, keyBuffer);
}
