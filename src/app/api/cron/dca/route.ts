import { NextResponse } from "next/server";
import { applyDueDcaEvents } from "@/lib/dca";

// Appelé quotidiennement par Vercel Cron (voir vercel.json). Protégé par
// CRON_SECRET plutôt que par une session : ce n'est pas une route utilisateur.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const created = await applyDueDcaEvents();
  return NextResponse.json({ created });
}
