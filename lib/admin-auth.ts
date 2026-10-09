import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "osuna_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) return { email, password };
  if (process.env.NODE_ENV !== "production") {
    return { email: "admin@opticaosuna.co", password: "OsunaDemo2025!" };
  }
  return null;
}

function getSessionSecret() {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (configured) return configured;
  return process.env.NODE_ENV !== "production" ? "local-osuna-session-secret-change-before-deploy" : null;
}

export function createAdminSession() {
  const secret = getSessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET must be configured before enabling admin sessions.");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const signature = createHmac("sha256", secret).update(String(expiresAt)).digest("base64url");
  return { token: `${expiresAt}.${signature}`, maxAge: SESSION_DURATION_SECONDS };
}

export function isValidAdminSession(token: string | undefined) {
  if (!token) return false;
  const [expiry, signature, extra] = token.split(".");
  if (!expiry || !signature || extra || !/^\d+$/.test(expiry) || !/^[A-Za-z0-9_-]{43}$/.test(signature) || Number(expiry) <= Math.floor(Date.now() / 1000)) return false;
  const secret = getSessionSecret();
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(expiry).digest();
  const provided = Buffer.from(signature, "base64url");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
