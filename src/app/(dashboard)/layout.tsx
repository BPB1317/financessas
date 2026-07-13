import { requireSession } from "@/lib/session";
import { getFundData } from "@/lib/data";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TickerTape, type TickerItem } from "@/components/dashboard/TickerTape";
import { NavLinks } from "@/components/dashboard/NavLinks";

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
  const { members, events, settings } = await getFundData();
  const memberById = new Map(members.map((m) => [m.id, m]));

  const tickerItems: TickerItem[] = [...events]
    .filter((e) => !e.hidden)
    .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
    .slice(0, 20)
    .map((event) => ({
      id: event.id,
      memberName: memberById.get(event.member_id)?.name ?? "—",
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
              {settings.fund_name}
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
          <NavLinks
            links={NAV_LINKS}
            adminLink={session.role === "admin" ? { href: "/admin", label: "Administration" } : undefined}
          />
        </div>
      </header>
      <TickerTape items={tickerItems} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
