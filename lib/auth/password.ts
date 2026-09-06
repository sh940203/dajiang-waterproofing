import "server-only";
import { argon2id, argon2Verify } from "hash-wasm";

// argon2id 參數（與 scripts/seed.ts 一致）
const PARAMS = {
  parallelism: 1,
  iterations: 3,
  memorySize: 19456, // ~19 MiB
  hashLength: 32,
  outputType: "encoded" as const,
};

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return argon2id({ password, salt, ...PARAMS });
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2Verify({ password, hash });
  } catch {
    return false;
  }
}
