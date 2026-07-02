import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Première ligne de défense : redirige vers /login si aucune session valide,
// et empêche les rôles "viewer" d'accéder à /admin. Chaque page/action
// vérifie aussi la session de son côté (voir lib/session.ts) — le proxy seul
// ne suffit jamais à garantir la sécurité (voir doc Next.js sur les Server
// Functions).
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
