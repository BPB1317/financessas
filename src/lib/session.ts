import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import type { Session } from "@/lib/types";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);
}

// À appeler en haut de chaque page/route/server action protégée : le proxy
// couvre la navigation normale, mais ne doit pas être la seule ligne de
// défense (voir la doc Next.js sur les Server Functions).
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/");
  return session;
}
