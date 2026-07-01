#!/usr/bin/env node
/**
 * CLI tool to encrypt a plaintext password using AES-256-GCM + scrypt.
 *
 * Usage:
 *   # Ensure MASTER_KEY is set (in your .env.* file or shell)
 *   node utils/encrypt-credential.js "Cfusion2016"
 *
 *   # Or inline:
 *   $env:MASTER_KEY="your-secret-key"; node utils/encrypt-credential.js "Cfusion2016"
 *
 * Output:
 *   enc:3a9f...:11b2...:ab45...:00ff...
 *
 * Paste the token into config/users/{client}/{role}.json → "password" field.
 *
 * Each call produces a DIFFERENT token (random salt+IV) — all decrypt to the same plaintext.
 *
 * To verify: node utils/encrypt-credential.js --decrypt "enc:..."
 */

"use strict";

const path = require("path");
const dotenv = require("dotenv");

// Load .env.production as fallback so MASTER_KEY can be sourced from it during local dev
const testEnv = process.env.TEST_ENV || "production";
dotenv.config({ path: path.resolve(__dirname, `../.env.${testEnv}`) });
dotenv.config({ path: path.resolve(__dirname, `../.env.production`) });

const { encryptPassword, decryptPassword } = require("./crypto-helper");

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Encrypt Credential CLI
──────────────────────
Encrypt:  node utils/encrypt-credential.js "your-password"
Decrypt:  node utils/encrypt-credential.js --decrypt "enc:..."

MASTER_KEY must be set in environment or .env.${testEnv} file.
`);
    process.exit(0);
  }

  const isDecrypt = args[0] === "--decrypt" || args[0] === "-d";
  const value     = isDecrypt ? args[1] : args[0];

  if (!value) {
    console.error("Error: no value provided.");
    process.exit(1);
  }

  try {
    if (isDecrypt) {
      const plain = await decryptPassword(value);
      console.log(`\nDecrypted value:\n${plain}\n`);
    } else {
      const token = await encryptPassword(value);
      console.log(`\nEncrypted token (paste into your user JSON):\n${token}\n`);
    }
  } catch (err) {
    console.error(`\nError: ${err.message}\n`);
    process.exit(1);
  }
}

main();
