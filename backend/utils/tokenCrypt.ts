import crypto from "crypto";

const algorithm = process.env.TOKEN_CRYPTO_ALGORITHM || "aes-256-gcm";
const keyEncoding = process.env.TOKEN_CRYPTO_KEY_ENCODING || "hex";
const ivLength = Number(process.env.TOKEN_CRYPTO_IV_LENGTH || 12);

function getKeyBuffer(): Buffer {
	const rawKey = process.env.TOKEN_CRYPTO_KEY;

	if (!rawKey) {
		throw new Error("TOKEN_CRYPTO_KEY is not set");
	}

	const key = Buffer.from(rawKey, keyEncoding as BufferEncoding);

	if (key.length !== 32) {
		throw new Error("TOKEN_CRYPTO_KEY must be 32 bytes for aes-256-gcm");
	}

	return key;
}

export function encrypt(token: string): string {
	const key = getKeyBuffer();
	const iv = crypto.randomBytes(ivLength);
	const cipher = crypto.createCipheriv(algorithm, key, iv) as crypto.CipherGCM;

	const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
	const authTag = cipher.getAuthTag();

	return [
		iv.toString("base64"),
		encrypted.toString("base64"),
		authTag.toString("base64"),
	].join(":");
}

export function decrypt(hashedToken: string): string {
	const key = getKeyBuffer();
	const [ivBase64, encryptedBase64, authTagBase64] = hashedToken.split(":");

	if (!ivBase64 || !encryptedBase64 || !authTagBase64) {
		throw new Error("Invalid encrypted token format");
	}

	const iv = Buffer.from(ivBase64, "base64");
	const encrypted = Buffer.from(encryptedBase64, "base64");
	const authTag = Buffer.from(authTagBase64, "base64");

	const decipher = crypto.createDecipheriv(algorithm, key, iv) as crypto.DecipherGCM;
	decipher.setAuthTag(authTag);

	const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
	return decrypted.toString("utf8");
}
