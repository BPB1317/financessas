import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { applyDueDcaEvents } from "@/lib/dca";
import { FUND_DATA_TAG } from "@/lib/data";

// Appelé quotidiennement par Vercel Cron (voir vercel.json). Protégé par
// CRON_SECRET plutôt que par une session : ce n'est pas une route utilisateur.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const created = await applyDueDcaEvents();
  // Route Handler, pas un Server Action : updateTag n'est pas utilisable ici,
  // "max" donne un stale-while-revalidate acceptable pour un cron.
  if (created > 0) revalidateTag(FUND_DATA_TAG, "max");
  return NextResponse.json({ created });
}
