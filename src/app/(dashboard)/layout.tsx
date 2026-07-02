import Link from "next/link";
import { requireSession } from "@/lib/session";
import { supabaseServer } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TickerTape, type TickerItem } from "@/components/dashboard/TickerTape";

const NAV_LINKS = [
  { href: "/", label: "Vue d'ensemble" },
  { href: "/performance", label: "Ma performance" },
  { href: "/investissements", label: "Investissements" },
  { href: "/bilans", label: "Bilans mensuels" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const supabase = supabaseServer();
  const [{ data: settings }, { data: recentEvents }] = await Promise.all([
    supabase.from("settings").select("fund_name").single(),
    supabase
      .from("investment_events")
      .select("id, date, amount, source, member:members(name)")
      .eq("hidden", false)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const tickerItems: TickerItem[] = (recentEvents ?? []).map((event) => ({
    id: event.id,
    memberName: (event.member as unknown as { name: string } | null)?.name ?? "—",
    amount: event.amount,
    date: event.date,
    isReinvestment: event.source === "reinvestment",
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-lg font-semibold tracking-tight">
              {settings?.fund_name ?? "SAS Betting"}
            </span>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <p className="font-medium leading-none">{session.name}</p>
                <Badge variant="secondary" className="mt-1">
                  {session.role === "admin" ? "Administrateur" : "Membre"}
                </Badge>
              </div>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  Déconnexion
                </Button>
              </form>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {session.role === "admin" && (
              <Link
                href="/admin"
                className="font-medium text-primary transition-colors hover:text-primary/80"
              >
                Administration
              </Link>
            )}
          </nav>
        </div>
      </header>
      <TickerTape items={tickerItems} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
