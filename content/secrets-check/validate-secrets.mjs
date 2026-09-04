import { createHmac, timingSafeEqual } from "node:crypto";

function fail(message) {
  console.error(`check-secrets: ${message}`);
  process.exit(1);
}

function requireValue(name) {
  const value = process.env[name]?.trim();
  if (!value) fail(`${name} is required`);
  return value;
}

function decodeJson(segment, label) {
  try {
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
  } catch {
    fail(`${label} is not valid base64url JSON`);
  }
}

function verifyJwt(name, token, secret, expectedRole) {
  const parts = token.split(".");
  if (parts.length !== 3) fail(`${name} is not a three-part JWT`);

  const header = decodeJson(parts[0], `${name} header`);
  const payload = decodeJson(parts[1], `${name} payload`);
  if (header.alg !== "HS256") fail(`${name} must use HS256`);
  if (payload.role !== expectedRole) fail(`${name} must carry role=${expectedRole}`);
  if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) {
    fail(`${name} is expired or has no numeric expiry`);
  }

  const expected = createHmac("sha256", secret)
    .update(`${parts[0]}.${parts[1]}`)
    .digest();
  const actual = Buffer.from(parts[2], "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    fail(`${name} was not signed by JWT_SECRET`);
  }
}

const jwtSecret = requireValue("JWT_SECRET");
if (jwtSecret.length < 32) fail("JWT_SECRET must contain at least 32 characters");

verifyJwt("ANON_KEY", requireValue("ANON_KEY"), jwtSecret, "anon");
verifyJwt(
  "SERVICE_ROLE_KEY",
  requireValue("SERVICE_ROLE_KEY"),
  jwtSecret,
  "service_role",
);

const routineKey = Buffer.from(requireValue("ROUTINE_SECRET_KEY"), "base64");
if (![16, 24, 32].includes(routineKey.length)) {
  fail("ROUTINE_SECRET_KEY must decode to 16, 24, or 32 bytes");
}

for (const name of ["POSTGRES_PASSWORD", "SECRET_KEY_BASE", "ALLOWED_ORIGIN"]) {
  requireValue(name);
}

console.log("check-secrets: Supabase credentials and runtime secrets are valid");
