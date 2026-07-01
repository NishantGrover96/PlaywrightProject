/**
 * AES-256-GCM credential encryption/decryption helper.
 *
 * Token format (all hex-encoded, colon-separated):
 *   enc:<saltHex>:<ivHex>:<ciphertextHex>:<authTagHex>
 *
 * Key derivation: scrypt(MASTER_KEY, salt, 32) — memory-hard, no extra deps.
 *
 * MASTER_KEY source (in priority order):
 *   1. process.env.MASTER_KEY   ← set in .env.* files locally, Azure DevOps secret variable in CI
 *
 * Usage:
 *   const { encryptPassword, decryptPassword, isEncrypted } = require('./utils/crypto-helper');
 *   const token = await encryptPassword('Cfusion2016');
 *   // → "enc:3a9f...:11b2...:ab45...:00ff..."
 *   const plain = await decryptPassword(token);
 *   // → "Cfusion2016"
 *
 * Passthrough: if value does not start with "enc:" it is returned unchanged.
 * This lets plain-text values work without any migration.
 */

"use strict";

const crypto = require("crypto");

const ALGORITHM    = "aes-256-gcm";
const SALT_BYTES   = 16;
const IV_BYTES     = 12;  // recommended for GCM
const KEY_LEN      = 32;  // 256-bit
const SCRYPT_N     = 16384;
const SCRYPT_r     = 8;
const SCRYPT_p     = 1;

// ── Master passphrase ──────────────────────────────────────────────────────

function getMasterPassphrase() {
  const key = process.env.MASTER_KEY;
  if (!key || key.trim() === "") {
    throw new Error(
      "[crypto-helper] MASTER_KEY environment variable is not set. " +
      "Set it in your .env.* file (local) or as an Azure DevOps secret variable (CI)."
    );
  }
  return key;
}

// ── Key derivation ─────────────────────────────────────────────────────────

function deriveKey(passphrase, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      passphrase,
      salt,
      KEY_LEN,
      { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p },
      (err, key) => {
        if (err) reject(err);
        else resolve(key);
      }
    );
  });
}

// ── Encryption ─────────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext string.
 * @param {string} plaintext
 * @returns {Promise<string>} enc:<saltHex>:<ivHex>:<ciphertextHex>:<authTagHex>
 */
async function encryptPassword(plaintext) {
  const passphrase = getMasterPassphrase();
  const salt = crypto.randomBytes(SALT_BYTES);
  const iv   = crypto.randomBytes(IV_BYTES);
  const key  = await deriveKey(passphrase, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const enc    = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag    = cipher.getAuthTag();

  return `enc:${salt.toString("hex")}:${iv.toString("hex")}:${enc.toString("hex")}:${tag.toString("hex")}`;
}

// ── Decryption ─────────────────────────────────────────────────────────────

/**
 * Decrypt a token produced by encryptPassword().
 * If value does not start with "enc:" it is returned as-is (plain-text passthrough).
 * @param {string} value
 * @returns {Promise<string>} plaintext
 */
async function decryptPassword(value) {
  if (!isEncrypted(value)) return value;  // passthrough for plain-text values

  const parts = value.split(":");
  if (parts.length !== 5 || parts[0] !== "enc") {
    throw new Error(`[crypto-helper] Malformed encrypted token: expected 5 colon-separated parts, got ${parts.length}`);
  }

  const [, saltHex, ivHex, ciphertextHex, tagHex] = parts;
  const salt       = Buffer.from(saltHex, "hex");
  const iv         = Buffer.from(ivHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");
  const tag        = Buffer.from(tagHex, "hex");

  const passphrase = getMasterPassphrase();
  const key        = await deriveKey(passphrase, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plain.toString("utf8");
  } catch {
    throw new Error("[crypto-helper] Decryption failed — wrong MASTER_KEY or corrupted token.");
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true if value is an encrypted token (starts with "enc:").
 * @param {string} value
 * @returns {boolean}
 */
function isEncrypted(value) {
  return typeof value === "string" && value.startsWith("enc:");
}

module.exports = { encryptPassword, decryptPassword, isEncrypted };
