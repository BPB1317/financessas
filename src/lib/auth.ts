import { SignJWT, jwtVerify } from "jose";
import type { Session } from "@/lib/types";

// Logique de session indépendante du framework (utilisable aussi bien dans
// proxy.ts que dans les route handlers / server components), pour que la
// vérification du JWT soit identique partout.

export const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 90; // 90 jours

function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET doit être défini (voir .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getAuthSecretKey());
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey());
    if (
      typeof payload.memberId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "viewer" && payload.role !== "admin")
    ) {
      return null;
    }
    return {
      memberId: payload.memberId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
